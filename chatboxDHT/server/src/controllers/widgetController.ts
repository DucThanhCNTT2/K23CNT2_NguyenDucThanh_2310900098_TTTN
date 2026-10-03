import { Request, Response } from 'express';
import crypto from 'node:crypto';
import { getSmartAIResponse } from '../services/aiService';
import { handleIncomingChannelMessage } from '../services/unifiedMessageHandler';
import { Conversation } from '../models/Conversation';
import { IMessage, Message } from '../models/Message';
import { sendInternalServerError } from '../../httpErrors';
import { env } from '../../config/env';
import { emitRealtimeEvent } from '../../realtime';

const widgetSessionCookie = 'dht_widget_session';

function getWidgetCustomerId(req: Request, res: Response): string {
  const cookie = req.cookies?.[widgetSessionCookie];
  if (typeof cookie === 'string') {
    const [sessionId, signature] = cookie.split('.');
    if (sessionId && signature && !cookie.split('.')[2]) {
      const expected = crypto.createHmac('sha256', env.jwtRefreshSecret).update(`widget:${sessionId}`).digest();
      const actual = Buffer.from(signature, 'hex');
      if (/^[a-f\d]{64}$/i.test(sessionId) && actual.length === expected.length && crypto.timingSafeEqual(actual, expected)) {
        return `widget_${sessionId}`;
      }
    }
  }

  const sessionId = crypto.randomBytes(32).toString('hex');
  const signature = crypto.createHmac('sha256', env.jwtRefreshSecret).update(`widget:${sessionId}`).digest('hex');
  res.cookie(widgetSessionCookie, `${sessionId}.${signature}`, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/api/widget'
  });
  return `widget_${sessionId}`;
}

export async function getWidgetMessages(req: Request, res: Response) {
  try {
    const customerId = getWidgetCustomerId(req, res);
    const conversation = await Conversation.findOne({
      channel: 'website',
      'customer.id': customerId
    }).lean();
    if (!conversation) return res.json({ success: true, data: [] });

    const messages = await Message.find({ conversationId: conversation.id })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();
    return res.json({ success: true, data: messages });
  } catch (error) {
    return sendInternalServerError(res, error, 'Widget message history');
  }
}

export async function sendWidgetMessage(req: Request, res: Response) {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  let customerId: string;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống.' });
  }
  if (content.length > 4000) {
    return res.status(400).json({ success: false, message: 'Tin nhắn vượt quá giới hạn 4.000 ký tự.' });
  }

  try {
    customerId = getWidgetCustomerId(req, res);
    const result = await handleIncomingChannelMessage({
      channel: 'website',
      senderId: customerId,
      senderName: 'Khách hàng Website',
      content
    });

    return res.json({
      success: true,
      data: {
        userMessage: result.userMessage,
        botReply: result.botReply,
        reply: result.botReply?.content || '',
        intentResult: result.intentResult,
        responseTimeMs: result.responseTimeMs,
        handledBy: result.handledBy
      }
    });

  } catch (error) {
    return sendInternalServerError(res, error, 'Widget message');
  }
}