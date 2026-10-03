import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { initialConversations, sampleMessages } from '../../../src/mock/data';
import { emitRealtimeEvent } from '../../realtime';
import { getSmartAIResponse, type ConversationTurn } from '../services/aiService';
import { sendFacebookMessage } from '../services/facebookMessengerService';
import { sendZaloMessage } from '../services/zaloService';
import { sendInternalServerError } from '../../httpErrors';

// In-memory fallback
let memoryConversations = [...initialConversations];
let memoryMessages: Record<string, any[]> = { ...sampleMessages };

function isStaff(req: Request): boolean {
  return ['admin', 'agent', 'supervisor'].includes((req as any).user?.role);
}

function canAccessConversation(req: Request, conversationId: string): boolean {
  const user = (req as any).user;
  return isStaff(req) || (user?.role === 'user' && conversationId === `conv_user_${user._id}`);
}

const emitNewMessage = (conversation: any, message: any) => {
  emitRealtimeEvent('new_message', {
    conversationId: conversation.id,
    message,
    customer: conversation.customer,
    channel: conversation.channel || conversation.customer?.channel,
    status: conversation.status,
    isBotHandling: conversation.isBotHandling,
    unreadCount: conversation.unreadCount
  });
};

export const getOrCreateUserConversation = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = String(user._id);
    const conversationId = `conv_user_${userId}`;
    const customer = {
      id: userId,
      name: user.name,
      email: user.email,
      avatar: '',
      phone: '',
      address: '',
      tags: [],
      notes: [],
      totalSpent: '0 ₫',
      orders: [],
      history: [],
      channel: 'website'
    };

    if (mongoose.connection.readyState === 1) {
      const conversation = await Conversation.findOneAndUpdate(
        { id: conversationId },
        {
          $setOnInsert: {
            id: conversationId,
            channel: 'website',
            customer,
            status: 'bot_active',
            isBotHandling: true,
            unreadCount: 0,
            messages: []
          }
        },
        { new: true, upsert: true }
      );
      return res.json({ success: true, data: conversation });
    }

    let conversation = memoryConversations.find(item => item.id === conversationId);
    if (!conversation) {
      const newConversation = {
        id: conversationId,
        channel: 'website',
        customer,
        status: 'bot_active',
        isBotHandling: true,
        unreadCount: 0,
        lastMessage: null,
        updatedAt: 'Vừa xong'
      } as any;
      conversation = newConversation;
      memoryConversations = [newConversation, ...memoryConversations];
    }
    return res.json({ success: true, data: conversation });
  } catch (error) {
    return sendInternalServerError(res, error, 'Create user conversation');
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const { channel, status, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query: any = {};
      if (channel && channel !== 'all') query.channel = channel;
      if (status && status !== 'all') query.status = status;

      let list = await Conversation.find(query).sort({ updatedAt: -1 });
      if (list.length === 0 && memoryConversations.length > 0) {
        // Seed default
        await Conversation.insertMany(memoryConversations as any);
        list = await Conversation.find(query).sort({ updatedAt: -1 });
      }
      return res.json({ success: true, data: list.map(item => ({ ...item.toObject(), id: item.id || item._id.toString() })) });
    }

    // In-memory fallback
    let list = memoryConversations;
    if (channel && channel !== 'all') list = list.filter(c => c.channel === channel);
    if (status && status !== 'all') list = list.filter(c => c.status === status);
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(c => 
        c.customer.name.toLowerCase().includes(q) || 
        c.lastMessage.content.toLowerCase().includes(q)
      );
    }
    return res.json({ success: true, data: list });
  } catch (error) {
    return sendInternalServerError(res, error, 'List conversations');
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const conversationId = String(req.params.conversationId);
    if (!canAccessConversation(req, conversationId)) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cuộc hội thoại.' });
    }

    if (mongoose.connection.readyState === 1) {
      let msgs = await Message.find({ conversationId }).sort({ createdAt: 1 });
      if (msgs.length === 0 && memoryMessages[conversationId]) {
        await Message.insertMany(memoryMessages[conversationId] as any);
        msgs = await Message.find({ conversationId }).sort({ createdAt: 1 });
      }
      return res.json({ success: true, data: msgs.map(item => ({ ...item.toObject(), id: item.id || item._id.toString() })) });
    }

    const msgs = memoryMessages[conversationId] || [];
    return res.json({ success: true, data: msgs });
  } catch (error) {
    return sendInternalServerError(res, error, 'Get conversation messages');
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const conversationId = String(req.params.conversationId);
    const currentUser = (req as any).user;
    if (!canAccessConversation(req, conversationId)) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cuộc hội thoại.' });
    }
    const { sender, senderName, content, cards, quickReplies } = req.body;
    const userText = String(content || '').trim();
    const messageSender: 'agent' | 'user' = isStaff(req) && sender === 'agent' ? 'agent' : 'user';

    if (!userText) {
      return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống.' });
    }

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = {
      id: 'msg_' + Date.now(),
      conversationId,
      sender: messageSender,
      senderName: messageSender === 'agent' ? (senderName || 'CSKH') : currentUser.name,
      content: userText,
      timestamp: time,
      status: 'sent' as const,
      cards,
      quickReplies,
      createdAt: new Date()
    };

    let conversation: any = null;
    let history: ConversationTurn[] = [];
    if (mongoose.connection.readyState === 1) {
      conversation = await Conversation.findOne({ id: conversationId });
      if (!conversation) {
        conversation = await Conversation.create({
          id: conversationId,
          channel: 'website',
          customer: {
            id: String(currentUser._id),
            name: currentUser.name,
            email: currentUser.email,
            avatar: ''
          },
          status: 'bot_active',
          isBotHandling: true,
          unreadCount: 0,
          messages: []
        });
      }
      const previousMessages = await Message.find({ conversationId }).sort({ createdAt: -1 }).limit(8).lean();
      history = previousMessages.reverse().map((message) => ({
        sender: message.sender,
        content: message.content
      }));

      if (messageSender === 'agent' && conversation.channel === 'facebook') {
        try {
          const targetId = String(conversation.customer?.channelUserId || conversation.customer?.id || '');
          await sendFacebookMessage(targetId, userText);
        } catch (error) {
          return sendInternalServerError(res, error, 'Facebook message delivery', 502);
        }
        conversation.isBotHandling = false;
        conversation.status = 'assigned';
      } else if (messageSender === 'agent' && conversation.channel === 'zalo') {
        try {
          const targetId = String(conversation.customer?.channelUserId || conversation.customer?.id || '');
          await sendZaloMessage(targetId, userText);
        } catch (error) {
          return sendInternalServerError(res, error, 'Zalo message delivery', 502);
        }
        conversation.isBotHandling = false;
        conversation.status = 'assigned';
      }

      await Message.create(userMessage);
      conversation.lastMessage = userMessage;
      conversation.updatedAt = new Date();
      if (messageSender === 'user') conversation.unreadCount = (conversation.unreadCount || 0) + 1;
      await conversation.save();
    } else {
      history = (memoryMessages[conversationId] || []).slice(-8).map((message) => ({
        sender: message.sender,
        content: message.content
      }));
    }

    if (!memoryMessages[conversationId]) memoryMessages[conversationId] = [];
    memoryMessages[conversationId].push(userMessage);

    memoryConversations = memoryConversations.map(c => {
      if (c.id === conversationId) {
        return { ...c, lastMessage: userMessage as any, updatedAt: 'Vừa xong' };
      }
      return c;
    });
    if (conversation) {
      emitNewMessage(conversation, userMessage);
    } else {
      const memoryConversation = memoryConversations.find((item) => item.id === conversationId);
      if (memoryConversation) emitNewMessage(memoryConversation, userMessage);
    }

    const effectiveConversation = conversation || memoryConversations.find((item) => item.id === conversationId);
    if (messageSender === 'agent' || effectiveConversation?.isBotHandling === false) {
      return res.json({ success: true, data: userMessage });
    }

    const botReplyText = await getSmartAIResponse(userText, history);
    const botReply = {
      id: 'msg_' + Date.now() + '_bot',
      conversationId,
      sender: 'bot' as const,
      senderName: 'DHT AI',
      content: botReplyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent' as const,
      cards: [],
      quickReplies: [],
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      await Message.create(botReply);
      await Conversation.findOneAndUpdate(
        { id: conversationId },
        { lastMessage: botReply, updatedAt: new Date() }
      );
    }

    memoryMessages[conversationId] = [...(memoryMessages[conversationId] || []), botReply];
    memoryConversations = memoryConversations.map(c => {
      if (c.id === conversationId) {
        return { ...c, lastMessage: botReply as any, updatedAt: 'Vừa xong' };
      }
      return c;
    });
    if (conversation) emitNewMessage(conversation, botReply);

    return res.json({
      success: true,
      data: {
        userMessage,
        botReply
      }
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'Send conversation message');
  }
};

export const toggleBotSwitch = async (req: Request, res: Response) => {
  try {
    const conversationId = String(req.params.conversationId);
    let nextBotState = false;

    if (mongoose.connection.readyState === 1) {
      const conv = await Conversation.findOne({ id: conversationId });
      if (conv) {
        nextBotState = !conv.isBotHandling;
        conv.isBotHandling = nextBotState;
        conv.status = nextBotState ? 'bot_active' : 'assigned';
        await conv.save();
      }
    }

    memoryConversations = memoryConversations.map(c => {
      if (c.id === conversationId) {
        nextBotState = !c.isBotHandling;
        return {
          ...c,
          isBotHandling: nextBotState,
          status: nextBotState ? 'bot_active' : 'assigned'
        };
      }
      return c;
    });

    return res.json({ 
      success: true, 
      isBotHandling: nextBotState,
      message: nextBotState ? 'Bot AI đã kích hoạt' : 'CSKH đã tiếp quản' 
    });
  } catch (error) {
    return sendInternalServerError(res, error, 'Toggle bot handling');
  }
};

export const submitRating = async (req: Request, res: Response) => {
  try {
    const conversationId = String(req.params.conversationId);
    if (!canAccessConversation(req, conversationId)) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy cuộc hội thoại.' });
    }
    const { score, feedback } = req.body;

    if (!Number.isInteger(Number(score)) || Number(score) < 1 || Number(score) > 5) {
      return res.status(400).json({ success: false, message: 'Điểm đánh giá phải từ 1 đến 5.' });
    }
    const rating = {
      score: Number(score),
      feedback: feedback || '',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (mongoose.connection.readyState === 1) {
      await Conversation.findOneAndUpdate(
        { id: conversationId },
        { rating, status: 'resolved' }
      );
    }

    memoryConversations = memoryConversations.map(c => 
      c.id === conversationId ? { ...c, rating, status: 'resolved' } : c
    );

    return res.json({ success: true, data: rating });
  } catch (error) {
    return sendInternalServerError(res, error, 'Submit conversation rating');
  }
};
