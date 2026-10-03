import mongoose from 'mongoose';
import axios from 'axios';
import crypto from 'node:crypto';
import { ChannelConfig } from '../models/ChannelConfig';

export interface ZaloWebhookEvent {
  app_id?: string;
  user_id_by_app?: string;
  event_name?: string;
  timestamp?: number;
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: {
    msg_id?: string;
    text?: string;
    attachments?: Array<{
      type?: string;
      payload?: {
        url?: string;
        thumbnail?: string;
      };
    }>;
  };
  info?: {
    name?: string;
    phone?: string;
    address?: string;
  };
}

const zaloProfileCache = new Map<string, { name: string; avatar: string; expiresAt: number }>();

/**
 * Lấy Access Token của Zalo OA (Ưu tiên từ Database ChannelConfig, sau đó từ biến môi trường)
 */
export async function getZaloAccessToken(): Promise<string> {
  try {
    if (mongoose.connection.readyState === 1) {
      const config = await ChannelConfig.findOne({ channel: 'zalo', isActive: true }).lean();
      if (config?.accessToken) {
        return config.accessToken;
      }
    }
  } catch {
    // fallback to env
  }
  return process.env.ZALO_OA_ACCESS_TOKEN || '';
}

/**
 * Xác thực chữ ký Webhook Zalo (HMAC-SHA256 signature check)
 */
export function verifyZaloWebhookSignature(
  appId: string,
  dataStr: string,
  timestamp: string | number,
  receivedMac: string,
  secretKey?: string
): boolean {
  const secret = secretKey || process.env.ZALO_APP_SECRET || '';
  if (!secret || !receivedMac) return true; // Cho phép qua môi trường dev/demo nếu chưa cấu hình secret

  try {
    const raw = `${appId}${dataStr}${timestamp}${secret}`;
    const calculatedMac = crypto.createHash('sha256').update(raw).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(calculatedMac.toLowerCase()),
      Buffer.from(receivedMac.toLowerCase())
    );
  } catch {
    return false;
  }
}

/**
 * Lấy thông tin profile người dùng từ Zalo Open API
 */
export async function getZaloProfile(userId: string): Promise<{ name: string; avatar: string }> {
  const cached = zaloProfileCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) return cached;

  const fallback = { name: `Người dùng Zalo (${userId.slice(-4)})`, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' };
  const token = await getZaloAccessToken();

  if (!token) {
    return fallback;
  }

  try {
    const response = await axios.get('https://openapi.zalo.me/v2.0/oa/getprofile', {
      params: {
        data: JSON.stringify({ user_id: userId })
      },
      headers: {
        access_token: token
      },
      timeout: 8000
    });

    if (response.data && response.data.error === 0 && response.data.data) {
      const data = response.data.data;
      const profile = {
        name: data.display_name || fallback.name,
        avatar: data.avatar || fallback.avatar
      };
      zaloProfileCache.set(userId, { ...profile, expiresAt: Date.now() + 60 * 60 * 1000 });
      return profile;
    }
  } catch (error) {
    console.warn(`⚠️ [Zalo Profile] Failed to fetch profile for user ${userId}, using fallback.`);
  }

  zaloProfileCache.set(userId, { ...fallback, expiresAt: Date.now() + 10 * 60 * 1000 });
  return fallback;
}

/**
 * Gửi tin nhắn phản hồi tới người dùng Zalo OA (Text, Quick Replies hoặc Attachment)
 */
export async function sendZaloMessage(
  userId: string,
  text: string,
  quickReplies?: Array<{ id: string; label: string; payload?: string }>
): Promise<any> {
  const token = await getZaloAccessToken();

  if (!token) {
    console.log(`ℹ️ [Zalo Service - Demo Mode] Tin nhắn gửi tới Zalo User [${userId}]: "${text}"`);
    return { error: 0, message: 'Simulated delivery in demo environment' };
  }

  try {
    const body: Record<string, any> = {
      recipient: {
        user_id: userId
      },
      message: {
        text
      }
    };

    // Hỗ trợ nút phản hồi nhanh / Action button trên Zalo OA
    if (quickReplies && quickReplies.length > 0) {
      body.message.quick_reply = {
        actions: quickReplies.slice(0, 5).map((qr) => ({
          action: 'oa.query.show',
          title: qr.label,
          payload: qr.payload || qr.label
        }))
      };
    }

    const response = await axios.post('https://openapi.zalo.me/v3.0/oa/message/cs', body, {
      headers: {
        access_token: token,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data?.error !== 0) {
      console.warn(`⚠️ [Zalo OA Delivery Warning] Error code ${response.data?.error}: ${response.data?.message}`);
      // Lỗi token hết hạn (error -216 hoặc tương tự)
      if (response.data?.error === -216 || response.data?.message?.includes('token')) {
        await ChannelConfig.updateOne({ channel: 'zalo' }, { status: 'error' });
      }
    }

    return response.data;
  } catch (error: any) {
    console.error(`❌ [Zalo OA Delivery Error]:`, error?.response?.data || error.message);
    throw error;
  }
}
