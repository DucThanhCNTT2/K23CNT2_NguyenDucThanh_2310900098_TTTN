import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  avatar: string;
  phone: string;
  email: string;
  address: string;
  tags: string[];
  notes: string[];
  totalSpent: string;
  channel: 'website' | 'facebook' | 'zalo';
  lastActive: string;
  orders: Array<{
    id: string;
    orderCode: string;
    date: string;
    total: string;
    status: string;
    itemsSummary: string;
  }>;
  history: Array<{
    channel: string;
    timestamp: string;
    summary: string;
  }>;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  tags: [{ type: String }],
  notes: [{ type: String }],
  totalSpent: { type: String, default: '0 ₫' },
  channel: { type: String, enum: ['website', 'facebook', 'zalo'], default: 'website' },
  lastActive: { type: String, default: 'Vừa xong' },
  orders: [{
    orderCode: String,
    date: String,
    total: String,
    status: String,
    itemsSummary: String
  }],
  history: [{
    channel: String,
    timestamp: String,
    summary: String
  }]
});

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
