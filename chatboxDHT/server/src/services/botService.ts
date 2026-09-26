import mongoose from 'mongoose';
import { BotFlow } from '../models/BotFlow';
import { initialBotNodes } from '../../../src/mock/data';

const defaultFlow = {
  botName: 'DHT AI Assistant',
  tone: 'friendly',
  temperature: 0.3,
  systemPrompt: 'Bạn là trợ lý ảo AI của DHT AI Solution Corp.',
  nodes: initialBotNodes,
  isActive: true
};

let memoryBotFlow: any = { ...defaultFlow };

export async function getBotFlowData() {
  if (mongoose.connection.readyState === 1) {
    let flow = await BotFlow.findOne({ isActive: true }).lean();
    if (!flow) {
      flow = await BotFlow.create(memoryBotFlow);
    }
    memoryBotFlow = flow as any;
    return flow;
  }

  return memoryBotFlow;
}

export async function saveBotFlowData(payload: any) {
  const normalized = {
    botName: payload?.botName || memoryBotFlow.botName,
    tone: payload?.tone || memoryBotFlow.tone,
    temperature: payload?.temperature ?? memoryBotFlow.temperature,
    systemPrompt: payload?.systemPrompt || memoryBotFlow.systemPrompt,
    nodes: payload?.nodes || memoryBotFlow.nodes,
    isActive: true
  };

  if (mongoose.connection.readyState === 1) {
    const flow = await BotFlow.findOneAndUpdate({ isActive: true }, normalized, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();
    memoryBotFlow = flow as any;
    return flow;
  }

  memoryBotFlow = normalized;
  return normalized;
}
