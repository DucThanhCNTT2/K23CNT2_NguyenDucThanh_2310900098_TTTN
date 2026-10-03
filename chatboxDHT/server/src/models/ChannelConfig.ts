import mongoose, { Schema, Document } from 'mongoose';

export interface IChannelConfig extends Document {
  channel: 'website' | 'facebook' | 'zalo';
  name: string;
  appId?: string;
  appSecret?: string;
  accessToken?: string;
  verifyToken?: string;
  webhookUrl: string;
  pageId?: string;
  oaId?: string;
  isActive: boolean;
  status: 'connected' | 'disconnected' | 'error';
  lastSyncAt?: Date;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ChannelConfigSchema = new Schema<IChannelConfig>(
  {
    channel: { type: String, enum: ['website', 'facebook', 'zalo'], required: true, unique: true },
    name: { type: String, required: true },
    appId: { type: String, default: '' },
    appSecret: { type: String, default: '' },
    accessToken: { type: String, default: '' },
    verifyToken: { type: String, default: '' },
    webhookUrl: { type: String, default: '' },
    pageId: { type: String, default: '' },
    oaId: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['connected', 'disconnected', 'error'], default: 'connected' },
    lastSyncAt: { type: Date, default: Date.now },
    settings: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const ChannelConfig =
  (mongoose.models.ChannelConfig as mongoose.Model<IChannelConfig>) ||
  mongoose.model<IChannelConfig>('ChannelConfig', ChannelConfigSchema);
