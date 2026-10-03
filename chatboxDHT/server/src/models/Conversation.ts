import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  id: string;
  customer: any;
  channel: 'website' | 'facebook' | 'zalo';
  status: 'pending' | 'bot_active' | 'assigned' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assignedAgent?: {
    id: string;
    name: string;
    avatar: string;
  };
  isBotHandling: boolean;
  unreadCount: number;
  messages: any[]; 
  lastMessage: any;
  rating?: {
    score: number;
    feedback?: string;
    createdAt: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  id: { type: String, required: true, unique: true, sparse: true, index: true },
  customer: { type: Schema.Types.Mixed, required: true },
  channel: { type: String, enum: ['website', 'facebook', 'zalo'], required: true },
  status: { type: String, enum: ['pending', 'bot_active', 'assigned', 'resolved'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  assignedAgent: {
    id: String,
    name: String,
    avatar: String
  },
  isBotHandling: { type: Boolean, default: true },
  unreadCount: { type: Number, default: 0 },
  messages: [{ type: Schema.Types.Mixed }], // <-- 2. Khai báo mảng messages trong Schema để lưu lịch sử chat
  lastMessage: { type: Schema.Types.Mixed },
  rating: {
    score: Number,
    feedback: String,
    createdAt: String
  }
}, { timestamps: true });

export const Conversation = (mongoose.models.Conversation as mongoose.Model<IConversation>) ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);