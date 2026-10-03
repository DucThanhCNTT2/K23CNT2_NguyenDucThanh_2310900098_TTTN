import nodemailer, { type Transporter } from 'nodemailer';
import { env } from './env';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let transporter: Transporter | null = null;

function createMailTransporter() {
  if (transporter) {
    return transporter;
  }

  const host = process.env.EMAIL_HOST;
  const user = process.env.EMAIL_USER;
  const password = process.env.EMAIL_APP_PASSWORD;

  if (!host || !user || !password || password === 'REPLACE_WITH_NEW_GMAIL_APP_PASSWORD') {
    throw new Error('Chưa cấu hình EMAIL_HOST, EMAIL_USER và EMAIL_APP_PASSWORD trên server.');
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: { user, pass: password }
  });

  return transporter;
}

export async function sendPasswordResetCode(email: string, code: string) {
  const recipient = email.trim().toLowerCase();
  if (!emailPattern.test(recipient)) {
    throw new Error('Địa chỉ email nhận mã không hợp lệ.');
  }

  const sender = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  if (!sender) {
    throw new Error('Chưa cấu hình địa chỉ email gửi trên server.');
  }

  await createMailTransporter().sendMail({
    from: sender,
    to: recipient,
    replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
    subject: 'Mã khôi phục mật khẩu - DHT ChatAI',
    text: `Mã khôi phục mật khẩu của bạn là ${code}. Mã có hiệu lực trong ${env.resetPasswordExpiresMinutes} phút.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1e293b">
        <h2>Khôi phục mật khẩu DHT ChatAI</h2>
        <p>Mã xác thực của bạn là:</p>
        <p style="font-size:30px;font-weight:700;letter-spacing:8px;color:#4f46e5">${code}</p>
        <p>Mã có hiệu lực trong ${env.resetPasswordExpiresMinutes} phút. Nếu bạn không yêu cầu khôi phục mật khẩu, hãy bỏ qua email này.</p>
      </div>
    `
  });
}
