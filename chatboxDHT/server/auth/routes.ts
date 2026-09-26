import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { User, Message, Transaction } from '../models';
import { currentUser as mockUser } from '../../src/mock/data';
import { env } from '../config/env';
import { sendPasswordResetCode } from '../config/mail';
import { authenticateToken, requireAdmin } from './middleware';
import { generateToken, hashPassword } from './utils';

const router = Router();

// --- AUTH APIs ---
router.post(['/api/auth/register', '/api/auth/signup'], async (req: Request, res: Response) => {
  try {
    const { companyName, fullName, email, password } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đăng ký!' });
    }

    const emailLower = email.toLowerCase().trim();
    if (await User.findOne({ email: emailLower })) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký!' });
    }

    const newUser = await User.create({
      name: fullName,
      email: emailLower,
      password: hashPassword(password),
      companyName: companyName || 'Doanh Nghiệp Mới',
      plan: 'Pro',
      role: 'user'
    });

    return res.status(201).json({
      success: true,
      token: generateToken(newUser._id.toString()),
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, companyName: newUser.companyName }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/api/users/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    if (currentUser?._id?.toString() === id) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự xóa tài khoản Admin của chính mình!' });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng cần xóa.' });
    }

    return res.json({ success: true, message: 'Đã xóa tài khoản thành công!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp email và mật khẩu!' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác!' });
    }

    return res.json({
      success: true,
      token: generateToken(user._id.toString()),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, companyName: user.companyName, plan: user.plan }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
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
    user.passwordResetCodeHash = hashPassword(code);
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
      console.error('❌ [Password Reset Email Failed]:', mailError.message);
      return res.status(503).json({
        success: false,
        message: mailError.message.includes('Chưa cấu hình')
          ? mailError.message
          : 'Không thể gửi email lúc này. Vui lòng kiểm tra tài khoản Gmail, App Password và kết nối SMTP.'
      });
    }

    return res.json({ success: true, message: 'Mã xác thực đã được gửi tới email của bạn.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
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
      user.passwordResetCodeHash !== hashPassword(code)
    ) {
      return res.status(400).json({ success: false, message: 'Mã OTP không đúng hoặc đã hết hạn!' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresMinutes = env.resetPasswordExpiresMinutes;
    user.passwordResetTokenHash = hashPassword(resetToken);
    user.passwordResetTokenExpiresAt = new Date(Date.now() + expiresMinutes * 60 * 1000);
    user.passwordResetCodeHash = undefined;
    user.passwordResetCodeExpiresAt = undefined;
    await user.save();

    return res.json({ success: true, resetToken });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    const resetToken = String(req.body.resetToken || '').trim();
    const newPassword = String(req.body.newPassword || '');
    if (!email || !resetToken || newPassword.length < 8) {
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
      user.passwordResetTokenHash !== hashPassword(resetToken)
    ) {
      return res.status(400).json({ success: false, message: 'Phiên xác thực không hợp lệ hoặc đã hết hạn!' });
    }

    user.password = hashPassword(newPassword);
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();

    return res.json({ success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/auth/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Đăng xuất thành công!' });
});

router.get('/api/auth/me', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user || mockUser;
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

router.put('/api/auth/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser || !currentUser._id) {
      // Nếu là mockUser hoặc không có DB ID, cập nhật giả lập
      return res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: {
          id: currentUser?.id || 'usr_mock',
          name: req.body.name || currentUser?.name,
          email: currentUser?.email,
          avatar: req.body.avatar || currentUser?.avatar,
          role: currentUser?.role || 'user',
          companyName: req.body.companyName || currentUser?.companyName,
          plan: currentUser?.plan || 'Pro',
          phone: req.body.phone || ''
        }
      });
    }

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
      if (user.password !== hashPassword(currentPassword)) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác!' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      }
      user.password = hashPassword(newPassword);
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/api/users/usage', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const planLimits: Record<string, number> = {
      Starter: 500,
      Pro: 2500,
      Enterprise: 10000
    };

    let userDoc: any = null;
    if (currentUser?._id) {
      userDoc = await User.findById(currentUser._id);
    }

    const currentPlan = userDoc?.plan || currentUser?.plan || 'Pro';
    const baseLimit = planLimits[currentPlan] || 2500;
    const extraLimit = userDoc?.extraMessages || 0;
    const totalMax = baseLimit + extraLimit;

    let usedCount = 0;
    if (currentUser?._id) {
      const convId = `conv_user_${currentUser._id}`;
      usedCount = await Message.countDocuments({
        $or: [
          { conversationId: convId },
          { sender: 'user' }
        ]
      });
    } else {
      usedCount = await Message.countDocuments({ sender: 'user' });
    }

    const percentage = Math.min(100, Math.round((usedCount / totalMax) * 100));
    const remaining = Math.max(0, totalMax - usedCount);

    return res.json({
      success: true,
      data: {
        usedMessages: usedCount,
        maxMessages: totalMax,
        baseMessages: baseLimit,
        extraMessages: extraLimit,
        percentage,
        remainingMessages: remaining,
        plan: currentPlan
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// BILLING & ANALYTICS APIS DÀNH CHO USER
// ==========================================
router.get('/api/billing/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser?._id) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực' });
    }

    let history = await Transaction.find({ userId: String(currentUser._id) }).sort({ createdAt: -1 }).lean();

    // Nếu chưa có giao dịch nào, tự động tạo giao dịch khởi tạo gói ban đầu cho user
    if (history.length === 0) {
      const userDoc = await User.findById(currentUser._id);
      const planName = userDoc?.plan || 'Pro';
      const prices: Record<string, number> = { Starter: 490000, Pro: 1490000, Enterprise: 4990000 };
      const quotas: Record<string, number> = { Starter: 500, Pro: 2500, Enterprise: 10000 };

      const initialTx = await Transaction.create({
        userId: String(currentUser._id),
        userEmail: currentUser.email,
        userName: currentUser.name || 'Khách hàng',
        invoiceCode: `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-00${String(currentUser._id).slice(-4)}`,
        title: `Kích hoạt Gói ${planName} Đa Kênh (1 Tháng)`,
        type: 'plan_subscription',
        amount: prices[planName] || 1490000,
        currency: 'VND',
        status: 'completed',
        paymentMethod: 'VietQR',
        messagesAdded: quotas[planName] || 2500,
        notes: 'Gói thuê bao định kỳ kích hoạt thành công.'
      });

      history = [initialTx.toObject()];
    }

    return res.json({
      success: true,
      data: history.map((t: any) => ({
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/billing/purchase-addon', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    if (!currentUser?._id) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực' });
    }

    const { packId, packName, messagesCount, amount, paymentMethod } = req.body;
    if (!messagesCount || !amount) {
      return res.status(400).json({ success: false, message: 'Dữ liệu gói mua không hợp lệ.' });
    }

    const invoiceCode = `INV-${Date.now().toString().slice(-6)}-ADD`;

    // 1. Tạo bản ghi giao dịch
    const newTx = await Transaction.create({
      userId: String(currentUser._id),
      userEmail: currentUser.email,
      userName: currentUser.name || 'Khách hàng',
      invoiceCode,
      title: `Mua thêm ${packName || 'Gói tin nhắn'} (+${Number(messagesCount).toLocaleString()} tin)`,
      type: 'addon_messages',
      amount: Number(amount),
      currency: 'VND',
      status: 'completed',
      paymentMethod: paymentMethod || 'VietQR',
      messagesAdded: Number(messagesCount),
      notes: `Gói phụ ${packId || 'addon'} kích hoạt tự động qua VietQR`
    });

    // 2. Tăng extraMessages cho User
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $inc: { extraMessages: Number(messagesCount) } },
      { new: true }
    );

    // 3. Gửi thông báo xác nhận tự động vào cuộc trò chuyện CSKH
    const convId = `conv_user_${currentUser._id}`;
    await Message.create({
      conversationId: convId,
      sender: 'bot',
      senderName: 'DHT AI Billing Bot',
      content: `🎉 [XÁC NHẬN THANH TOÁN THÀNH CÔNG]\nHệ thống đã ghi nhận thanh toán cho gói [${packName || 'Gói Bổ Sung'}].\n• Mã hóa đơn: ${invoiceCode}\n• Dung lượng cộng thêm: +${Number(messagesCount).toLocaleString()} tin nhắn AI\n• Trạng thái: Đã cộng vào tài khoản ngay lập tức!\nChúc bạn kinh doanh hồng phát cùng DHT ChatAI! 🚀`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered'
    });

    return res.json({
      success: true,
      message: 'Kích hoạt gói phụ thành công! Dung lượng đã được cộng ngay lập tức.',
      transaction: newTx,
      newTotalExtra: updatedUser?.extraMessages || 0
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/api/billing/analytics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    let userDoc: any = null;
    if (currentUser?._id) {
      userDoc = await User.findById(currentUser._id);
    }

    const planLimits: Record<string, number> = { Starter: 500, Pro: 2500, Enterprise: 10000 };
    const currentPlan = userDoc?.plan || currentUser?.plan || 'Pro';
    const totalMax = (planLimits[currentPlan] || 2500) + (userDoc?.extraMessages || 0);

    let usedCount = 0;
    if (currentUser?._id) {
      const convId = `conv_user_${currentUser._id}`;
      usedCount = await Message.countDocuments({
        $or: [{ conversationId: convId }, { sender: 'user' }]
      });
    } else {
      usedCount = await Message.countDocuments({ sender: 'user' });
    }

    const remaining = Math.max(0, totalMax - usedCount);

    // Dữ liệu tiêu thụ 7 ngày gần nhất
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const now = new Date();
    const dailyUsage = days.map((day, index) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - index));
      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
      
      // Tạo phân bổ dựa trên lượng tin nhắn đã dùng
      const baseDaily = Math.max(12, Math.round(usedCount / 14) + (index * 4) + ((index % 3) * 5));
      const webCount = Math.round(baseDaily * 0.62);
      const fbCount = Math.round(baseDaily * 0.26);
      const zaloCount = Math.max(1, baseDaily - webCount - fbCount);

      return {
        day,
        date: dateStr,
        website: webCount,
        facebook: fbCount,
        zalo: zaloCount,
        total: webCount + fbCount + zaloCount
      };
    });

    const avgDaily = Math.round(dailyUsage.reduce((acc, curr) => acc + curr.total, 0) / 7) || 28;
    const estDays = avgDaily > 0 ? Math.round(remaining / avgDaily) : 30;

    return res.json({
      success: true,
      data: {
        dailyUsage,
        channelDistribution: {
          website: 62,
          facebook: 26,
          zalo: 12
        },
        burnRate: {
          avgDaily,
          estimatedDaysRemaining: Math.max(1, estDays),
          status: estDays < 5 ? 'critical' : estDays < 12 ? 'warning' : 'good'
        },
        aiResolutionRate: '94.8%',
        avgResponseTime: '1.8 giây'
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/api/users', authenticateToken, async (_req: Request, res: Response) => {
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/api/users/:id/role', authenticateToken, async (req: Request, res: Response) => {
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});


export default router;
