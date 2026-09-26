import { User } from '../../models';
import { hashPassword } from '../../auth/utils';

export async function seedInitialUsers() {
  if (await User.countDocuments() > 0) return;

  await User.insertMany([
    {
      name: 'Dương Chí Du',
      email: 'admin@chatai.vn',
      password: hashPassword('admin123456'),
      role: 'admin',
      companyName: 'DHT AI Solution Corp',
      plan: 'Enterprise',
      isOnline: true
    },
    {
      name: 'Nguyễn CSKH',
      email: 'agent.hieu@chatai.vn',
      password: hashPassword('agent123456'),
      role: 'agent',
      companyName: 'DHT AI Solution Corp',
      plan: 'Pro',
      isOnline: true
    }
  ]);

  console.log('🌱 [Seed Data] Đã tạo tài khoản Admin & CSKH mẫu');
}
