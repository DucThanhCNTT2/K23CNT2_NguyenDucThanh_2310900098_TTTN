import mongoose, { Schema, Document } from 'mongoose';

export interface ICannedResponse extends Document {
  shortcut: string;
  title: string;
  content: string;
  category: 'chao_hoi' | 'bao_gia' | 'ho_tro' | 'chinh_sach';
}

const CannedResponseSchema = new Schema<ICannedResponse>({
  shortcut: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['chao_hoi', 'bao_gia', 'ho_tro', 'chinh_sach'], default: 'chao_hoi' }
});

export const CannedResponse = mongoose.model<ICannedResponse>('CannedResponse', CannedResponseSchema);
