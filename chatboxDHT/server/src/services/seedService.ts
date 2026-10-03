import { User } from '../../models';
import { hashPassword, verifyPassword } from '../../auth/utils';

export async function seedInitialUsers() {
  if (process.env.NODE_ENV === 'production') {
    const sampleAccounts = [
      { email: 'admin@chatai.vn', password: 'admin123456' },
      { email: 'agent.hieu@chatai.vn', password: 'agent123456' }
    ];
    for (const sampleAccount of sampleAccounts) {
      const existing = await User.findOne({ email: sampleAccount.email });
      if (existing && (await verifyPassword(sampleAccount.password, existing.password)).valid) {
        throw new Error(`Replace the development seed password for ${sampleAccount.email} before production.`);
      }
    }
    if (await User.countDocuments() > 0) return;

    const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.INITIAL_ADMIN_PASSWORD;
    if (!email || !password || password.length < 12) {
      throw new Error('Set INITIAL_ADMIN_EMAIL and an INITIAL_ADMIN_PASSWORD of at least 12 characters before first production startup.');
    }

    await User.create({
      name: process.env.INITIAL_ADMIN_NAME?.trim() || 'Administrator',
      email,
      password: await hashPassword(password),
      role: 'admin',
      companyName: 'DHT AI Solution Corp',
      plan: 'Enterprise',
      isOnline: true
    });
    console.log('🌱 [Seed Data] Đã tạo tài khoản Admin ban đầu từ cấu hình production');
    return;
  }

  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Refusing to seed sample accounts outside development.');
  }
  if (await User.countDocuments() > 0) return;

  await User.insertMany([
    {
      name: 'Dương Chí Du',
      email: 'admin@chatai.vn',
      password: await hashPassword('admin123456'),
      role: 'admin',
      companyName: 'DHT AI Solution Corp',
      plan: 'Enterprise',
      isOnline: true
    },
    {
      name: 'Nguyễn CSKH',
      email: 'agent.hieu@chatai.vn',
      password: await hashPassword('agent123456'),
      role: 'agent',
      companyName: 'DHT AI Solution Corp',
      plan: 'Pro',
      isOnline: true
    }
  ]);

  console.log('🌱 [Seed Data] Đã tạo tài khoản Admin & CSKH mẫu');
}
