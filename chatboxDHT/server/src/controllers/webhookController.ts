import { createHmac, timingSafeEqual } from 'node:crypto';
import { Request, Response } from 'express';
import { logInternalError } from '../../httpErrors';
import { getFacebookProfile } from '../services/facebookMessengerService';
import { getZaloProfile, verifyZaloWebhookSignature } from '../services/zaloService';
import { handleIncomingChannelMessage } from '../services/unifiedMessageHandler';
import { ChannelConfig } from '../models/ChannelConfig';

interface FacebookMessageEvent {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    attachments?: Array<{ type?: string; payload?: { url?: string } }>;
  };
  timestamp?: number;
}

function isValidFacebookSignature(req: Request) {
  const appSecret = process.env.FB_APP_SECRET;
  const signature = req.get('x-hub-signature-256') || '';
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!appSecret || !rawBody || !signature.startsWith('sha256=')) return false;

  const received = Buffer.from(signature.slice('sha256='.length), 'hex');
  const expected = createHmac('sha256', appSecret).update(rawBody).digest();
  return received.length === expected.length && timingSafeEqual(received, expected);
}

/**
 * 10. Xác thực Webhook Facebook Messenger (verify token)
 */
export const verifyFacebookWebhook = async (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  let verifyToken = process.env.FB_VERIFY_TOKEN;
  if (!verifyToken) {
    const config = await ChannelConfig.findOne({ channel: 'facebook' }).lean();
    verifyToken = config?.verifyToken || 'dht_fb_verify_token_2026';
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ [Facebook Webhook] Xác thực Webhook Meta thành công!');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

/**
 * 8, 11, 12, 13. Tiếp nhận và xử lý sự kiện tin nhắn từ Facebook Messenger
 */
export const receiveFacebookWebhook = (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production' && !process.env.FB_APP_SECRET) {
    return res.sendStatus(503);
  }
  if (process.env.FB_APP_SECRET && !isValidFacebookSignature(req)) {
    return res.sendStatus(401);
  }

  const body = req.body;

  if (body.object === 'page') {
    const events: FacebookMessageEvent[] = [];
    for (const entry of body.entry || []) {
      events.push(...(entry.messaging || []));
    }

    res.status(200).send('EVENT_RECEIVED');

    for (const event of events) {
      if (!event.message || event.message.is_echo) continue;
      const psid = event.sender?.id;
      if (!psid) continue;

      const messageText = String(event.message.text || '').trim() ||
        (event.message.attachments?.length ? '[Khách đã gửi tệp đính kèm]' : '');

      void (async () => {
        try {
          const profile = await getFacebookProfile(psid);
          await handleIncomingChannelMessage({
            channel: 'facebook',
            senderId: psid,
            senderName: profile.name,
            senderAvatar: profile.avatar,
            content: messageText,
            attachments: event.message?.attachments,
            externalMsgId: event.message?.mid ? `facebook_${event.message.mid}` : undefined
          });
        } catch (error) {
          logInternalError(error, 'Facebook webhook processing');
        }
      })();
    }
    return;
  }

  return res.sendStatus(404);
};

/**
 * 10. Xác thực Webhook Zalo OA (verify token / challenge)
 */
export const verifyZaloWebhook = (req: Request, res: Response) => {
  const challenge = req.query.challenge || req.query['hub.challenge'];
  if (challenge) {
    console.log('✅ [Zalo Webhook] Xác thực URL Webhook Zalo OA thành công!');
    return res.status(200).send(challenge);
  }
  return res.status(200).json({ error: 0, message: 'Zalo Webhook endpoint active' });
};

/**
 * 9, 11, 12, 13. Tiếp nhận và xử lý sự kiện tin nhắn từ Zalo Official Account (Zalo OA)
 */
export const receiveZaloWebhook = (req: Request, res: Response) => {
  const body = req.body || {};
  const appId = body.app_id || '';
  const timestamp = body.timestamp || Date.now();
  const mac = req.headers['x-zevent-signature'] || body.mac || '';

  // Kiểm tra chữ ký an toàn nếu có cấu hình
  if (mac && !verifyZaloWebhookSignature(appId, JSON.stringify(body), timestamp, String(mac))) {
    console.warn('⚠️ [Zalo Webhook] Invalid signature received.');
    return res.status(401).json({ error: -1, message: 'Invalid MAC signature' });
  }

  // Phản hồi ngay cho Zalo server để không bị retry timeout
  res.status(200).json({ error: 0, message: 'Success' });

  // Xử lý các sự kiện tin nhắn từ Zalo OA
  const eventName = body.event_name;
  const userId = body.sender?.id || body.user_id_by_app;

  if (userId && (eventName === 'user_send_text' || eventName === 'user_send_image' || eventName === 'user_send_link' || !eventName)) {
    let content = body.message?.text || '';
    if (!content && body.message?.attachments?.length) {
      content = '[Khách gửi hình ảnh Zalo]';
    }
    if (!content && eventName === 'user_send_image') {
      content = '[Hình ảnh từ Zalo]';
    }

    if (!content) return;

    void (async () => {
      try {
        const profile = await getZaloProfile(userId);
        await handleIncomingChannelMessage({
          channel: 'zalo',
          senderId: userId,
          senderName: profile.name,
          senderAvatar: profile.avatar,
          content,
          attachments: body.message?.attachments,
          externalMsgId: body.message?.msg_id ? `zalo_${body.message.msg_id}` : undefined
        });
      } catch (error) {
        logInternalError(error, 'Zalo webhook message processing');
      }
    })();
  }
};