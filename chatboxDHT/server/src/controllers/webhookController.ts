import { Request, Response } from 'express';

export const verifyFacebookWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN || 'dht_ai_messenger_verify_token_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ [Facebook Webhook] Xác thực Webhook Meta thành công!');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

export const receiveFacebookWebhook = (req: Request, res: Response) => {
  const body = req.body;

  if (body.object === 'page') {
    body.entry?.forEach((entry: any) => {
      const webhookEvent = entry.messaging?.[0];
      if (webhookEvent) {
        const senderPsid = webhookEvent.sender?.id;
        const messageText = webhookEvent.message?.text;
        console.log(`💬 [Facebook Messenger] Nhận tin nhắn từ PSID ${senderPsid}: "${messageText}"`);
      }
    });

    return res.status(200).send('EVENT_RECEIVED');
  }

  return res.sendStatus(404);
};

export const receiveZaloWebhook = (req: Request, res: Response) => {
  const body = req.body;
  const eventName = body.event_name;
  const senderId = body.sender?.id;
  const messageText = body.message?.text;

  console.log(`📱 [Zalo OA Webhook] Sự kiện ${eventName} từ User ${senderId}: "${messageText}"`);

  return res.status(200).json({ error: 0, message: 'Success' });
};
