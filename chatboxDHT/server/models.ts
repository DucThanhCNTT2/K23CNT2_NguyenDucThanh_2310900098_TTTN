import mongoose from 'mongoose';

const model = <T extends mongoose.Schema>(name: string, schema: T) =>
  mongoose.models[name] || mongoose.model(name, schema);

export const User = model('User', new mongoose.Schema({
  name: { type: String, required: true }, email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  role: { type: String, enum: ['admin', 'agent', 'supervisor', 'user'], default: 'user' },
  companyName: { type: String, default: 'DHT AI Solution Corp' }, phone: { type: String, default: '' },
  plan: { type: String, enum: ['Starter', 'Pro', 'Enterprise'], default: 'Pro' }, extraMessages: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: true }, passwordResetCodeHash: String, passwordResetCodeExpiresAt: Date,
  passwordResetTokenHash: String, passwordResetTokenExpiresAt: Date
}, { timestamps: true }));

export const Conversation = model('Conversation', new mongoose.Schema({
  id: { type: String, required: true, unique: true }, customer: { type: mongoose.Schema.Types.Mixed, required: true },
  channel: { type: String, enum: ['website', 'facebook', 'zalo'], required: true },
  status: { type: String, enum: ['pending', 'bot_active', 'assigned', 'resolved'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }, assignedAgent: mongoose.Schema.Types.Mixed,
  isBotHandling: { type: Boolean, default: true }, unreadCount: { type: Number, default: 0 },
  lastMessage: mongoose.Schema.Types.Mixed, rating: mongoose.Schema.Types.Mixed
}, { timestamps: true }));

export const Message = model('Message', new mongoose.Schema({
  id: { type: String, required: true }, conversationId: { type: String, required: true, index: true },
  sender: { type: String, enum: ['user', 'bot', 'agent'], required: true }, senderName: String, senderAvatar: String,
  content: { type: String, required: true }, timestamp: String,
  status: { type: String, enum: ['sending', 'sent', 'delivered', 'seen'], default: 'sent' },
  cards: [mongoose.Schema.Types.Mixed], quickReplies: [mongoose.Schema.Types.Mixed], attachments: [mongoose.Schema.Types.Mixed]
}, { timestamps: true }));

export const Faq = model('Faq', new mongoose.Schema({
  question: { type: String, required: true }, answer: { type: String, required: true },
  category: { type: String, default: 'Chung' }, updatedAt: { type: String, default: 'Hôm nay' }
}, { timestamps: true }));

export const Doc = model('Doc', new mongoose.Schema({
  name: { type: String, required: true }, size: String, type: String, status: { type: String, default: 'trained' }, chunksCount: Number
}, { timestamps: true }));

export const Canned = model('Canned', new mongoose.Schema({
  shortcut: { type: String, required: true }, title: { type: String, required: true }, content: { type: String, required: true },
  category: { type: String, default: 'chao_hoi' }
}, { timestamps: true }));

export const Transaction = model('Transaction', new mongoose.Schema({
  userId: { type: String, required: true }, userEmail: { type: String, required: true }, userName: { type: String, default: 'Khách hàng' },
  invoiceCode: { type: String, required: true, unique: true }, title: { type: String, required: true },
  type: { type: String, enum: ['plan_subscription', 'addon_messages', 'renewal'], default: 'addon_messages' },
  amount: { type: Number, required: true }, currency: { type: String, default: 'VND' },
  status: { type: String, enum: ['completed', 'pending', 'cancelled'], default: 'completed' },
  paymentMethod: { type: String, default: 'VietQR' }, messagesAdded: { type: Number, default: 0 }, notes: { type: String, default: '' }
}, { timestamps: true }));
