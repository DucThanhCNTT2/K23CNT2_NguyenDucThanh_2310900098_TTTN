import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { BotFlow } from '../models/BotFlow';
import { initialBotNodes } from '../../../src/mock/data';

let memoryBotFlow = {
  botName: 'DHT AI Assistant',
  tone: 'friendly',
  temperature: 0.3,
  systemPrompt: 'Bạn là trợ lý ảo AI của DHT AI Solution Corp.',
  nodes: initialBotNodes,
  isActive: true
};

export const getBotFlow = async (_req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let flow = await BotFlow.findOne({ isActive: true });
      if (!flow) {
        flow = await BotFlow.create(memoryBotFlow);
      }
      return res.json({ success: true, data: flow });
    }
    return res.json({ success: true, data: memoryBotFlow });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const saveBotFlow = async (req: Request, res: Response) => {
  try {
    const { botName, tone, temperature, systemPrompt, nodes } = req.body;
    const updated = {
      botName: botName || memoryBotFlow.botName,
      tone: tone || memoryBotFlow.tone,
      temperature: temperature ?? memoryBotFlow.temperature,
      systemPrompt: systemPrompt || memoryBotFlow.systemPrompt,
      nodes: nodes || memoryBotFlow.nodes,
      isActive: true
    };

    if (mongoose.connection.readyState === 1) {
      await BotFlow.findOneAndUpdate({ isActive: true }, updated, { upsert: true, new: true });
    }

    memoryBotFlow = updated;
    return res.json({ success: true, data: updated, message: 'Đã lưu cấu hình Bot AI' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
