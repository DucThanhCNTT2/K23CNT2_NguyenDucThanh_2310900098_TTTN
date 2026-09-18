export type ChannelType = 'website' | 'facebook' | 'zalo';
export type ConversationStatus = 'pending' | 'bot_active' | 'assigned' | 'resolved';
export type Priority = 'low' | 'medium' | 'high';
export type MessageSenderType = 'user' | 'bot' | 'agent';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen';

export interface ProductCard {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  image: string;
  description: string;
  url?: string;
}

export interface QuickReply {
  id: string;
  label: string;
  payload: string;
}

export interface ChatAttachment {
  type: 'image' | 'video' | 'file';
  url: string;
  name: string;
  size?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSenderType;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  status: MessageStatus;
  cards?: ProductCard[];
  quickReplies?: QuickReply[];
  attachments?: ChatAttachment[];
}

export interface OrderItem {
  id: string;
  orderCode: string;
  date: string;
  total: string;
  status: 'completed' | 'processing' | 'cancelled';
  itemsSummary: string;
}

export interface ChannelHistory {
  channel: ChannelType;
  timestamp: string;
  summary: string;
}

export interface Customer {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
  tags: string[];
  notes: string[];
  totalSpent: string;
  channel: ChannelType;
  lastActive: string;
  orders: OrderItem[];
  history: ChannelHistory[];
}

export interface Conversation {
  id: string;
  customer: Customer;
  channel: ChannelType;
  status: ConversationStatus;
  priority: Priority;
  assignedAgent?: {
    id: string;
    name: string;
    avatar: string;
  };
  isBotHandling: boolean;
  unreadCount: number;
  lastMessage: Message;
  rating?: {
    score: number;
    feedback?: string;
    createdAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CannedResponse {
  id: string;
  shortcut: string;
  title: string;
  content: string;
  category: 'chao_hoi' | 'bao_gia' | 'ho_tro' | 'chinh_sach';
}

export interface BotNode {
  id: string;
  type: 'trigger' | 'message' | 'question' | 'condition' | 'agent_transfer' | 'card_carousel';
  title: string;
  content?: string;
  data?: any;
  position: { x: number; y: number };
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  updatedAt: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'txt' | 'url';
  status: 'trained' | 'processing' | 'failed';
  trainedAt: string;
  chunksCount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'agent' | 'supervisor';
  companyName: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
}
