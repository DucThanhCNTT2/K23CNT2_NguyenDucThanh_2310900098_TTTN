import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { initialConversations, sampleMessages } from '../../../src/mock/data';

// In-memory fallback
let memoryConversations = [...initialConversations];
let memoryMessages: Record<string, any[]> = { ...sampleMessages };

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
      return res.json({ success: true, data: list });
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (mongoose.connection.readyState === 1) {
      let msgs = await Message.find({ conversationId }).sort({ createdAt: 1 });
      if (msgs.length === 0 && memoryMessages[conversationId]) {
        await Message.insertMany(memoryMessages[conversationId] as any);
        msgs = await Message.find({ conversationId }).sort({ createdAt: 1 });
      }
      return res.json({ success: true, data: msgs });
    }

    const msgs = memoryMessages[conversationId] || [];
    return res.json({ success: true, data: msgs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { sender, senderName, content, cards, quickReplies } = req.body;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: 'msg_' + Date.now(),
      conversationId,
      sender: sender || 'agent',
      senderName: senderName || 'CSKH',
      content,
      timestamp: time,
      status: 'sent',
      cards,
      quickReplies,
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      await Message.create(newMsg);
      await Conversation.findOneAndUpdate(
        { id: conversationId },
        { lastMessage: newMsg, updatedAt: new Date() }
      );
    }

    // In memory update
    if (!memoryMessages[conversationId]) memoryMessages[conversationId] = [];
    memoryMessages[conversationId].push(newMsg);

    memoryConversations = memoryConversations.map(c => {
      if (c.id === conversationId) {
        return { ...c, lastMessage: newMsg as any, updatedAt: 'Vừa xong' };
      }
      return c;
    });

    return res.json({ success: true, data: newMsg });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleBotSwitch = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitRating = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { score, feedback } = req.body;

    const rating = {
      score: Number(score) || 5,
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
