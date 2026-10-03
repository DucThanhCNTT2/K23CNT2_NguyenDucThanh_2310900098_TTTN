import mongoose from 'mongoose';
import axios from 'axios';
import { ChannelConfig } from '../models/ChannelConfig';

interface FacebookProfileResponse {
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
}

const profileCache = new Map<string, { name: string; avatar: string; expiresAt: number }>();

function getGraphApiBaseUrl() {
  const version = process.env.META_GRAPH_API_VERSION || 'v26.0';
  return `https://graph.facebook.com/${version}`;
}

export async function getFacebookPageAccessToken(): Promise<string> {
  try {
    if (mongoose.connection.readyState === 1) {
      const config = await ChannelConfig.findOne({ channel: 'facebook', isActive: true }).lean();
      if (config?.accessToken) {
        return config.accessToken;
      }
    }
  } catch {
    // fallback
  }
  return process.env.FB_PAGE_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
}

export async function getFacebookProfile(psid: string) {
  const cached = profileCache.get(psid);
  if (cached && cached.expiresAt > Date.now()) return cached;

  const fallback = { name: `Facebook User (${psid.slice(-4)})`, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' };
  const token = await getFacebookPageAccessToken();

  if (!token) {
    return fallback;
  }

  try {
    const response = await axios.get<FacebookProfileResponse>(
      `${getGraphApiBaseUrl()}/${encodeURIComponent(psid)}`,
      {
        params: {
          fields: 'first_name,last_name,profile_pic',
          access_token: token
        },
        timeout: 8000
      }
    );
    const name = [response.data.first_name, response.data.last_name].filter(Boolean).join(' ');
    const profile = {
      name: name || fallback.name,
      avatar: response.data.profile_pic || fallback.avatar
    };
    profileCache.set(psid, { ...profile, expiresAt: Date.now() + 60 * 60 * 1000 });
    return profile;
  } catch (error) {
    profileCache.set(psid, { ...fallback, expiresAt: Date.now() + 10 * 60 * 1000 });
    return fallback;
  }
}

/**
 * Gửi tin nhắn phản hồi tới Facebook Messenger người dùng (hỗ trợ text, quick_replies, generic templates)
 */
export async function sendFacebookMessage(
  psid: string,
  text: string,
  quickReplies?: Array<{ id: string; label: string; payload?: string }>,
  cards?: any[]
) {
  const token = await getFacebookPageAccessToken();
  if (!token) {
    console.log(`ℹ️ [Facebook Service - Demo Mode] Tin nhắn gửi tới Facebook PSID [${psid}]: "${text}"`);
    return { recipient_id: psid, message_id: `mid_sim_${Date.now()}` };
  }

  const messagePayload: Record<string, any> = { text };

  // Định dạng Quick Replies cho Facebook Messenger
  if (quickReplies && quickReplies.length > 0) {
    messagePayload.quick_replies = quickReplies.slice(0, 10).map((qr) => ({
      content_type: 'text',
      title: qr.label.slice(0, 20),
      payload: qr.payload || qr.id
    }));
  }

  // Định dạng Carousel Cards cho Facebook Messenger nếu có
  if (cards && cards.length > 0) {
    messagePayload.attachment = {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: cards.slice(0, 10).map((card) => ({
          title: card.title || 'Thông tin',
          image_url: card.image || undefined,
          subtitle: card.description || card.price || '',
          buttons: [
            {
              type: 'postback',
              title: 'Xem chi tiết',
              payload: `CARD_${card.id || 'view'}`
            }
          ]
        }))
      }
    };
    delete messagePayload.text; // Meta generic template không gửi kèm text cùng lúc
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await axios.post(
        `${getGraphApiBaseUrl()}/me/messages`,
        {
          recipient: { id: psid },
          message: messagePayload
        },
        {
          params: { access_token: token },
          timeout: 5000 // Tối ưu timeout 5s giúp web không bị kẹt khi Facebook quá tải
        }
      );
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      const fbErrorCode = error?.response?.data?.error?.code;

      // Xử lý an toàn nếu Token bị hỏng/hết hạn (mã lỗi 190): ngắt luôn không retry gây đơ server
      if (fbErrorCode === 190 || status === 400 || status === 401) {
        console.warn(`⚠️ [Facebook Token Expired/Invalid]: Token Facebook không hợp lệ (Code ${fbErrorCode}). Tạm thời bỏ qua gửi Messenger.`);
        try {
          if (mongoose.connection.readyState === 1) {
            await ChannelConfig.updateOne({ channel: 'facebook' }, { status: 'error', isActive: false });
          }
        } catch {
          // Bỏ qua lỗi DB nếu có
        }
        return { recipient_id: psid, message_id: `mid_fallback_${Date.now()}`, warning: 'Facebook token expired' };
      }

      const isTransientFailure = status === 429 || status >= 500;
      if (isTransientFailure && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }

      console.warn(`⚠️ [Facebook Delivery Error]:`, error?.response?.data || error.message);
      return { recipient_id: psid, message_id: `mid_err_${Date.now()}` };
    }
  }

  return { recipient_id: psid, message_id: `mid_failed_${Date.now()}` };
}