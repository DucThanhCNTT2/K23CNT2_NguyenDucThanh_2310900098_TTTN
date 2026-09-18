import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: 'admin' | 'agent' | 'supervisor';
  companyName: string;
  plan: 'Starter' | 'Pro' | 'Enterprise';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  role: { type: String, enum: ['admin', 'agent', 'supervisor'], default: 'agent' },
  companyName: { type: String, default: 'DHT AI Solution Corp' },
  plan: { type: String, enum: ['Starter', 'Pro', 'Enterprise'], default: 'Pro' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model<IUser>('User', UserSchema);
