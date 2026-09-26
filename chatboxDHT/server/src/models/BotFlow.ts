import mongoose, { Schema, Document } from 'mongoose';

export interface IBotFlow extends Document {
  botName: string;
  tone: string;
  temperature: number;
  systemPrompt: string;
  nodes: any[];
  isActive: boolean;
}

const BotFlowSchema = new Schema<IBotFlow>({
  botName: { type: String, default: 'DHT AI Assistant' },
  tone: { type: String, default: 'friendly' },
  temperature: { type: Number, default: 0.3 },
  systemPrompt: { type: String, default: '' },
  nodes: [{ type: Schema.Types.Mixed }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const BotFlow = mongoose.model<IBotFlow>('BotFlow', BotFlowSchema);
