import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { OAuthLoginTicket, User, Message, Transaction } from '../models';
import { env } from '../config/env';
import { sendPasswordResetCode } from '../config/mail';
import { authenticateToken, requireAdmin, requireAuthenticated } from './middleware';
import { generateToken, hashOneTimeSecret, hashPassword, verifyPassword } from './utils';
import { logInternalError, sendInternalServerError } from '../httpErrors';
import { disconnectUserSockets } from '../realtime';

const router = Router();

const oauthProviders = ['google', 'facebook', 'github'] as const;
type OAuthProvider = typeof oauthProviders[number];

interface OAuthIdentity {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

function isOAuthProvider(value: string): value is OAuthProvider {
  return oauthProviders.includes(value as OAuthProvider);
}

function getOAuthCredentials(provider: OAuthProvider) {
  return env.oauthCredentials[provider];
}

function oauthRedirectUri(provider: OAuthProvider): string {
  return `${env.oauthCallbackBaseUrl}/api/auth/oauth/${provider}/callback`;
}

function oauthCookieOptions() {
  const clientOrigin = new URL(env.clientUrl);
  const callbackOrigin = new URL(env.oauthCallbackBaseUrl);
  const isCrossSite = clientOrigin.protocol !== callbackOrigin.protocol ||
    clientOrigin.hostname !== callbackOrigin.hostname;
  const secure = env.isProduction || callbackOrigin.protocol === 'https:';

  return {
    secure,
    sameSite: isCrossSite && secure ? 'none' as const : 'lax' as const
  };
}

async function readOAuthJson(url: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new Error('OAuth provider request failed.');
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('OAuth provider returned an invalid response.');
  }
  return payload as Record<string, unknown>;
}

async function exchangeOAuthIdentity(
  provider: OAuthProvider,
  code: string,
  redirectUri: string
): Promise<OAuthIdentity> {
  const credentials = getOAuthCredentials(provider);
  const form = new URLSearchParams({
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    code,
    redirect_uri: redirectUri
  });
  let token: Record<string, unknown>;

  if (provider === 'google') {
    token = await readOAuthJson('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form
    });
  } else if (provider === 'facebook') {
    const tokenUrl = new URL(`https://graph.facebook.com/${env.oauthFacebookGraphVersion}/oauth/access_token`);
    form.forEach((value, key) => tokenUrl.searchParams.set(key, value));
    token = await readOAuthJson(tokenUrl.toString());
  } else {
    token = await readOAuthJson('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: form
    });
  }

  const accessToken = token.access_token;
  if (typeof accessToken !== 'string' || !accessToken) {
    throw new Error('OAuth provider did not return an access token.');
  }

  const authorization = { Authorization: `Bearer ${accessToken}` };
  let profile: Record<string, unknown>;
  let email: string | undefined;
  let verifiedEmail = false;

  if (provider === 'google') {
    profile = await readOAuthJson('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: authorization
    });
    email = typeof profile.email === 'string' ? profile.email : undefined;
    verifiedEmail = profile.email_verified === true;
    profile = { ...profile, avatar: profile.picture };
  } else if (provider === 'facebook') {
    const profileUrl = new URL(`https://graph.facebook.com/${env.oauthFacebookGraphVersion}/me`);
    profileUrl.searchParams.set('fields', 'id,name,email,picture.type(large)');
    profileUrl.searchParams.set('access_token', accessToken);
    profile = await readOAuthJson(profileUrl.toString());
    email = typeof profile.email === 'string' ? profile.email : undefined;
    verifiedEmail = Boolean(email);
    const picture = profile.picture as { data?: { url?: unknown } } | undefined;
    profile = { ...profile, avatar: picture?.data?.url };
  } else {
    profile = await readOAuthJson('https://api.github.com/user', {
      headers: { ...authorization, Accept: 'application/vnd.github+json' }
    });
    profile = { ...profile, avatar: profile.avatar_url };
    const emailList = await fetch('https://api.github.com/user/emails', {
      headers: { ...authorization, Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(10_000)
    });
    if (!emailList.ok) throw new Error('OAuth provider email request failed.');
    const emails: unknown = await emailList.json();
    if (Array.isArray(emails)) {
      const primary = emails.find((item): item is { email?: string; primary?: boolean; verified?: boolean } =>
        Boolean(item && typeof item === 'object' && 'primary' in item && 'verified' in item)
      );
      if (primary?.verified && typeof primary.email === 'string') {
        email = primary.email;
        verifiedEmail = true;
      }
    }
  }

  if (
    !verifiedEmail ||
    !email ||
    typeof profile.id !== 'string' && typeof profile.id !== 'number'
  ) {
    throw new Error('OAuth provider did not return a verified email and account id.');
  }

  return {
    id: String(profile.id),
    email: email.toLowerCase().trim(),
    name: typeof profile.name === 'string' && profile.name.trim()
      ? profile.name.trim()
      : email.split('@')[0],
    avatar: typeof profile.avatar === 'string' ? profile.avatar : undefined
  };
}

router.get('/api/auth/oauth/providers', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: Object.fromEntries(oauthProviders.map((provider) => {
      const { clientId, clientSecret } = getOAuthCredentials(provider);
      return [provider, Boolean(clientId && clientSecret && env.clientUrl && env.oauthCallbackBaseUrl)];
    }))
  });
});

router.get('/api/auth/oauth/:provider', (req: Request, res: Response) => {
  const provider = String(req.params.provider);
  if (!isOAuthProvider(provider)) {
    return res.status(404).json({ success: false, message: 'Phương thức đăng nhập không được hỗ trợ.' });
  }
  const { clientId, clientSecret } = getOAuthCredentials(provider);
  if (!clientId || !clientSecret || !env.clientUrl || !env.oauthCallbackBaseUrl) {
    return res.status(503).json({ success: false, message: 'Phương thức đăng nhập này chưa được cấu hình.' });
  }

  const state = crypto.randomBytes(32).toString('hex');
  const redirectUri = oauthRedirectUri(provider);
  const cookieOptions = oauthCookieOptions();
  const authUrl = new URL(
    provider === 'google'
      ? 'https://accounts.google.com/o/oauth2/v2/auth'
      : provider === 'facebook'
        ? `https://www.facebook.com/${env.oauthFacebookGraphVersion}/dialog/oauth`
        : 'https://github.com/login/oauth/authorize'
  );
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);
  if (provider === 'google') {
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('prompt', 'select_account');
  } else if (provider === 'facebook') {
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'email,public_profile');
  } else {
    authUrl.searchParams.set('scope', 'read:user user:email');
  }

  res.cookie(`dht_oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: cookieOptions.secure,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
    path: `/api/auth/oauth/${provider}/callback`
  });
  return res.redirect(authUrl.toString());
});

router.get('/api/auth/oauth/:provider/callback', async (req: Request, res: Response) => {
  const provider = String(req.params.provider);
  if (!isOAuthProvider(provider) || !env.clientUrl) return res.sendStatus(404);

  const stateCookie = `dht_oauth_state_${provider}`;
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const expectedState = req.cookies?.[stateCookie];
  res.clearCookie(stateCookie, { path: `/api/auth/oauth/${provider}/callback` });

  const loginUrl = new URL('/login', env.clientUrl);
  const stateBuffer = Buffer.from(state);
  const expectedBuffer = Buffer.from(typeof expectedState === 'string' ? expectedState : '');
  if (
    !state ||
    stateBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(stateBuffer, expectedBuffer)
  ) {
    loginUrl.searchParams.set('oauth_error', 'state');
    return res.redirect(loginUrl.toString());
  }
  if (typeof req.query.error === 'string' || typeof req.query.code !== 'string') {
    loginUrl.searchParams.set('oauth_error', 'cancelled');
    return res.redirect(loginUrl.toString());
  }

  try {
    const identity = await exchangeOAuthIdentity(provider, req.query.code, oauthRedirectUri(provider));
    let user = await User.findOne({
      socialAccounts: { $elemMatch: { provider, providerId: identity.id } }
    });

    if (!user) {
      user = await User.findOne({ email: identity.email });
      if (user) {
        user.socialAccounts = [...(user.socialAccounts || []), { provider, providerId: identity.id }];
        if (identity.avatar && !user.avatar) user.avatar = identity.avatar;
        await user.save();
      } else {
        user = await User.create({
          name: identity.name,
          email: identity.email,
          avatar: identity.avatar,
          role: 'user',
          companyName: 'Tài khoản cá nhân',
          socialAccounts: [{ provider, providerId: identity.id }]
        });
      }
    }

    const ticket = crypto.randomBytes(32).toString('hex');
    await OAuthLoginTicket.create({
      ticketHash: hashOneTimeSecret(ticket),
      userId: user._id.toString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 1000)
    });
    res.cookie('dht_oauth_result', ticket, {
      httpOnly: true,
      ...oauthCookieOptions(),
      maxAge: 2 * 60 * 1000,
      path: '/api/auth/oauth/exchange'
    });
    return res.redirect(new URL('/auth/callback', env.clientUrl).toString());
  } catch (error) {
    logInternalError(error, `OAuth ${provider} callback`);
    loginUrl.searchParams.set('oauth_error', 'failed');
    return res.redirect(loginUrl.toString());
  }
});

router.post('/api/auth/oauth/exchange', async (req: Request, res: Response) => {
  const ticket = req.cookies?.dht_oauth_result;
  res.clearCookie('dht_oauth_result', { path: '/api/auth/oauth/exchange' });
  if (typeof ticket !== 'string' || !/^[a-f\d]{64}$/i.test(ticket)) {
    return res.status(401).json({ success: false, message: 'Phiên đăng nhập xã hội không hợp lệ hoặc đã hết hạn.' });
  }

  try {
    const loginTicket = await OAuthLoginTicket.findOneAndDelete({
      ticketHash: hashOneTimeSecret(ticket),
      expiresAt: { $gt: new Date() }
    });
    if (!loginTicket) {
      return res.status(401).json({ success: false, message: 'Phiên đăng nhập xã hội không hợp lệ hoặc đã hết hạn.' });
    }
    const user = await User.findById(loginTicket.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Không tìm thấy tài khoản đăng nhập.' });
    }
    return res.json({
      success: true,
      token: generateToken(user._id.toString(), user.tokenVersion ?? 0),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        companyName: user.companyName,
        plan: user.plan
      }
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'OAuth login exchange');
  }
});

// --- AUTH APIs ---
router.post(['/api/auth/register', '/api/auth/signup'], async (req: Request, res: Response) => {
  try {
    const { companyName, fullName, email, password } = req.body;
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      typeof fullName !== 'string' ||
      !email.trim() ||
      !fullName.trim() ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng ký!' });
    }

    const emailLower = email.toLowerCase().trim();
    if (await User.findOne({ email: emailLower })) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký!' });
    }

    const newUser = await User.create({
      name: fullName,
      email: emailLower,
      password: await hashPassword(password),
      companyName: companyName || 'Doanh Nghiệp Mới',
      plan: 'Pro',
      role: 'user'
    });

    return res.status(201).json({
      success: true,
      token: generateToken(newUser._id.toString(), newUser.tokenVersion ?? 0),
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, companyName: newUser.companyName }
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'Auth registration');
  }
});

router.delete('/api/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const currentUser = (req as any).user;
    if (currentUser?._id?.toString() === id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự xóa tài khoản Admin của chính mình!' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng cần xóa.' });
    }
    disconnectUserSockets(id);

    return res.json({ success: true, message: 'Đã xóa tài khoản thành công!' });
  } catch (error) {
    return sendInternalServerError(res, error, 'User deletion');
  }
});

router.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password ||
      password.length > 128
    ) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu!' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác!' });
    }

    if (typeof user.password !== 'string') {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác!' });
    }
    const passwordResult = await verifyPassword(password, user.password);
    if (!passwordResult.valid) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác!' });
    }
    if (passwordResult.needsRehash) {
      user.password = await hashPassword(password);
      await user.save();
    }

    return res.json({
      success: true,
      token: generateToken(user._id.toString(), user.tokenVersion ?? 0),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, companyName: user.companyName, plan: user.plan }
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'Auth login');
  }
});

router.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập email tài khoản!' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này!' });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const expiresMinutes = env.resetPasswordExpiresMinutes;
    user.passwordResetCodeHash = hashOneTimeSecret(code);
    user.passwordResetCodeExpiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();

    try {
      await sendPasswordResetCode(email, code);
    } catch (mailError: any) {
      user.passwordResetCodeHash = undefined;
      user.passwordResetCodeExpiresAt = undefined;
      await user.save();
      return sendInternalServerError(res, mailError, 'Password reset email', 503);
    }

    return res.json({ success: true, message: 'Mã xác thực đã được gửi tới email của bạn.' });
  } catch (error) {
    return sendInternalServerError(res, error, 'Password reset request');
  }
});

router.post('/api/auth/verify-reset-code', async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const code = String(req.body.code || '').trim();
    if (!email || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: 'Email hoặc mã OTP không hợp lệ!' });
    }

    const user = await User.findOne({ email });
    if (
      !user ||
      !user.passwordResetCodeHash ||
      !user.passwordResetCodeExpiresAt ||
      user.passwordResetCodeExpiresAt.getTime() < Date.now() ||
      user.passwordResetCodeHash !== hashOneTimeSecret(code)
    ) {
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng hoặc đã hết hạn!' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresMinutes = env.resetPasswordExpiresMinutes;
    user.passwordResetTokenHash = hashOneTimeSecret(resetToken);
    user.passwordResetTokenExpiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
    user.passwordResetCodeHash = undefined;
    user.passwordResetCodeExpiresAt = undefined;
    await user.save();

    return res.json({ success: true, resetToken });
  } catch (error) {
    return sendInternalServerError(res, error, 'Password reset code verification');
  }
});

router.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.toLowerCase().trim() : '';
    const resetToken = typeof req.body.resetToken === 'string' ? req.body.resetToken.trim() : '';
    const newPassword = req.body.newPassword;
    if (
      !email ||
      !resetToken ||
      typeof newPassword !== 'string' ||
      newPassword.length < 8 ||
      newPassword.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 8 ký tự và thông tin xác thực không được trống!'
      });
    }

    const user = await User.findOne({ email });
    if (
      !user ||
      !user.passwordResetTokenHash ||
      !user.passwordResetTokenExpiresAt ||
      user.passwordResetTokenExpiresAt.getTime() < Date.now() ||
      user.passwordResetTokenHash !== hashOneTimeSecret(resetToken)
    ) {
      return res.status(400).json({ success: false, message: 'Phiên xác thực không hợp lệ hoặc đã hết hạn!' });
    }

    user.password = await hashPassword(newPassword);
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();
    disconnectUserSockets(user._id.toString());

    return res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (error) {
    return sendInternalServerError(res, error, 'Password reset');
  }
});

router.post('/api/auth/logout', authenticateToken, requireAuthenticated, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate((req as any).user._id, { $inc: { tokenVersion: 1 } });
    disconnectUserSockets((req as any).user._id.toString());
    return res.json({ success: true, message: 'Đăng xuất thành công!' });
  } catch (error) {
    return sendInternalServerError(res, error, 'Auth logout');
  }
});

router.get('/api/auth/me', authenticateToken, requireAuthenticated, (req: Request, res: Response) => {
  const user = (req as any).user;
  return res.json({
    success: true,
    data: {
      id: user._id ? user._id.toString() : (user.id || 'usr_default'),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role || 'user',
      companyName: user.companyName,
      plan: user.plan || 'Pro',
      phone: user.phone || ''
    }
  });
});

router.put('/api/auth/profile', authenticateToken, requireAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const user = await User.findById(currentUser._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng!' });
    }

    const { name, avatar, phone, companyName, currentPassword, newPassword } = req.body;

    // Đổi mật khẩu nếu có yêu cầu
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại!' });
      }
      if (typeof user.password !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Tài khoản đăng nhập xã hội chưa có mật khẩu. Hãy đặt mật khẩu qua chức năng quên mật khẩu.'
        });
      }
      const passwordResult = await verifyPassword(String(currentPassword), user.password);
      if (!passwordResult.valid) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác!' });
      }
      if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải từ 8 đến 128 ký tự!' });
      }
      user.password = await hashPassword(newPassword);
      user.tokenVersion = (user.tokenVersion ?? 0) + 1;
      disconnectUserSockets(user._id.toString());
    }

    if (name !== undefined && name.trim()) user.name = name.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (companyName !== undefined) user.companyName = companyName.trim();

    await user.save();

    return res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công!',
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        companyName: user.companyName,
        plan: user.plan,
        phone: user.phone
      }
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'Profile update');
  }
});

router.get('/api/users/usage', authenticateToken, requireAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const user = await User.findById(currentUser._id).select('plan extraMessages').lean();
    const planLimits: Record<string, number> = { Starter: 500, Pro: 2500, Enterprise: 10000 };
    const plan = user?.plan || currentUser.plan || 'Pro';
    const baseMessages = planLimits[plan] || planLimits.Pro;
    const extraMessages = Number(user?.extraMessages || 0);
    const maxMessages = baseMessages + extraMessages;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const usedMessages = await Message.countDocuments({
      conversationId: `conv_user_${currentUser._id}`,
      sender: 'bot',
      createdAt: { $gte: monthStart }
    });
    const percentage = Math.min(100, Math.round((usedMessages / maxMessages) * 100));

    return res.json({
      success: true,
      data: {
        usedMessages,
        maxMessages,
        baseMessages,
        extraMessages,
        percentage,
        remainingMessages: Math.max(0, maxMessages - usedMessages),
        plan
      }
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'User usage lookup');
  }
});

// ==========================================
// BILLING & ANALYTICS APIS DÀNH CHO USER
// ==========================================
router.get('/api/billing/history', authenticateToken, requireAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser?._id) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực' });
    }

    const history = await Transaction.find({ userId: String(currentUser._id) }).sort({ createdAt: -1 }).lean();
    const visibleHistory = history.filter((transaction: any) => !(
      transaction.type === 'plan_subscription' &&
      transaction.notes === 'Gói thuê bao định kỳ kích hoạt thành công.'
    ));

    return res.json({
      success: true,
      data: visibleHistory.map((t: any) => ({
        id: t._id,
        userId: t.userId,
        userEmail: t.userEmail,
        userName: t.userName,
        invoiceCode: t.invoiceCode,
        title: t.title,
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        paymentMethod: t.paymentMethod,
        messagesAdded: t.messagesAdded,
        notes: t.notes,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'Billing history');
  }
});

router.get('/api/billing/payment-config', authenticateToken, requireAuthenticated, (_req: Request, res: Response) => {
  const { billingBankId, billingBankName, billingAccountNumber, billingAccountName } = env;
  const enabled = Boolean(billingBankId && billingBankName && billingAccountNumber && billingAccountName);
  return res.json({
    success: true,
    data: {
      enabled,
      bankId: billingBankId,
      bankName: billingBankName,
      accountNumber: billingAccountNumber,
      accountName: billingAccountName
    }
  });
});

router.post('/api/billing/purchase-addon', authenticateToken, requireAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser?._id) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực' });
    }

    const packs: Record<string, { name: string; messagesCount: number; amount: number }> = {
      addon_500: { name: 'Gói Mini Phụ Trợ', messagesCount: 500, amount: 49000 },
      addon_1500: { name: 'Gói Tiêu Chuẩn Đa Kênh', messagesCount: 1500, amount: 129000 },
      addon_5000: { name: 'Gói Doanh Nghiệp Siêu Tốc', messagesCount: 5000, amount: 389000 }
    };
    const pack = typeof req.body.packId === 'string' ? packs[req.body.packId] : undefined;
    if (!pack) {
      return res.status(400).json({ success: false, message: 'Dữ liệu gói mua không hợp lệ.' });
    }
    if (!env.billingBankId || !env.billingBankName || !env.billingAccountNumber || !env.billingAccountName) {
      return res.status(503).json({ success: false, message: 'Thanh toán hiện chưa được cấu hình.' });
    }

    const invoiceCode = `INV-${Date.now().toString().slice(-6)}-ADD`;
    const newTx = await Transaction.create({
      userId: String(currentUser._id),
      userEmail: currentUser.email,
      userName: currentUser.name || 'Khách hàng',
      invoiceCode,
      title: `Yêu cầu mua ${pack.name} (+${pack.messagesCount.toLocaleString()} tin)`,
      type: 'addon_messages',
      amount: pack.amount,
      currency: 'VND',
      status: 'pending',
      paymentMethod: 'VietQR',
      messagesAdded: 0,
      notes: 'Đang chờ nhân viên đối soát thanh toán; dung lượng chưa được cộng.'
    });

    return res.json({
      success: true,
      message: 'Đã tạo yêu cầu thanh toán. Giao dịch đang chờ đối soát và dung lượng chưa được cộng.',
      transaction: newTx,
      newTotalExtra: currentUser.extraMessages || 0
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'Addon purchase');
  }
});

router.get('/api/billing/analytics', authenticateToken, requireAuthenticated, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const conversationId = `conv_user_${currentUser._id}`;
    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);
    const groupedUsage = await Message.aggregate([
      {
        $match: {
          conversationId,
          sender: 'bot',
          createdAt: { $gte: weekStart }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: 1 }
        }
      }
    ]);
    const usageByDate = new Map(groupedUsage.map((item: { _id: string; total: number }) => [item._id, item.total]));
    const dailyUsage = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateKey = date.toISOString().slice(0, 10);
      const total = usageByDate.get(dateKey) || 0;
      return {
        day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        date: date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' }),
        total
      };
    });
    const weeklyCount = dailyUsage.reduce((sum, day) => sum + day.total, 0);
    const avgDaily = Math.round(weeklyCount / 7);
    const user = await User.findById(currentUser._id).select('plan extraMessages').lean();
    const planLimits: Record<string, number> = { Starter: 500, Pro: 2500, Enterprise: 10000 };
    const maxMessages = (planLimits[user?.plan || currentUser.plan || 'Pro'] || planLimits.Pro) + Number(user?.extraMessages || 0);
    const usedThisMonth = await Message.countDocuments({
      conversationId,
      sender: 'bot',
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    const remaining = Math.max(0, maxMessages - usedThisMonth);
    const estimatedDaysRemaining = avgDaily > 0 ? Math.ceil(remaining / avgDaily) : null;

    return res.json({
      success: true,
      data: {
        dailyUsage,
        channelDistribution: null,
        burnRate: {
          avgDaily,
          estimatedDaysRemaining,
          status: avgDaily === 0 ? 'unknown' : estimatedDaysRemaining !== null && estimatedDaysRemaining < 5 ? 'critical' : estimatedDaysRemaining !== null && estimatedDaysRemaining < 12 ? 'warning' : 'good'
        },
        aiResolutionRate: null,
        avgResponseTime: null
      }
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'Billing analytics');
  }
});

router.get('/api/users', authenticateToken, requireAdmin, async (_req: Request, res: Response) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      data: users.map((user: any) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role || 'user',
        companyName: user.companyName,
        plan: user.plan || 'Pro',
        createdAt: user.createdAt,
        isOnline: user.isOnline ?? true
      }))
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'User listing');
  }
});

router.patch('/api/users/:id/role', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'agent', 'supervisor', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng.' });
    }
    disconnectUserSockets(user._id.toString());

    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        companyName: user.companyName,
        plan: user.plan,
        createdAt: user.createdAt,
        isOnline: user.isOnline ?? true
      }
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'User role update');
  }
});


export default router;
