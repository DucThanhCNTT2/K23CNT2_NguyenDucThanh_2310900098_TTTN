import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  id: string;
  conversationId: string;
  sender: 'user' | 'bot' | 'agent';
  senderName?: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
  cards?: any[];
  quickReplies?: any[];
  attachments?: any[];
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  id: { type: String, required: true, unique: true, sparse: true, index: true },
  conversationId: { type: String, required: true, index: true },
  sender: { type: String, enum: ['user', 'bot', 'agent'], required: true },
  senderName: { type: String },
  senderAvatar: { type: String },
  content: { type: String, required: true },
  timestamp: { type: String, required: true },
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'seen', 'failed'], default: 'sent' },
  cards: [{ type: Schema.Types.Mixed }],
  quickReplies: [{ type: Schema.Types.Mixed }],
  attachments: [{ type: Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now }
});

export const Message = (mongoose.models.Message as mongoose.Model<IMessage>) ||
  mongoose.model<IMessage>('Message', MessageSchema);
