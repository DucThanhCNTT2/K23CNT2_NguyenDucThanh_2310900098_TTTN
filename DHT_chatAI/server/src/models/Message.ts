import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  sender: 'user' | 'bot' | 'agent';
  senderName?: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'seen';
  cards?: any[];
  quickReplies?: any[];
  attachments?: any[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: String, required: true, index: true },
  sender: { type: String, enum: ['user', 'bot', 'agent'], required: true },
  senderName: { type: String },
  senderAvatar: { type: String },
  content: { type: String, required: true },
  timestamp: { type: String, required: true },
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'seen'], default: 'sent' },
  cards: [{ type: Schema.Types.Mixed }],
  quickReplies: [{ type: Schema.Types.Mixed }],
  attachments: [{ type: Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now }
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
