import mongoose, { Schema, Document } from 'mongoose';

export interface IFAQ extends Document {
  question: string;
  answer: string;
  category: string;
  intent?: string;
  keywords?: string[];
  updatedAt: string;
}

const FAQSchema = new Schema<IFAQ>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, default: 'Chung' },
  intent: { type: String, default: 'faq_general', index: true },
  keywords: [{ type: String }],
  updatedAt: { type: String, default: 'Hôm nay' }
}, { timestamps: true });

export const FAQ = (mongoose.models.FAQ as mongoose.Model<IFAQ>) ||
  mongoose.model<IFAQ>('FAQ', FAQSchema);


export interface IKnowledgeDoc extends Document {
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'txt' | 'url';
  status: 'trained' | 'processing' | 'failed';
  trainedAt: string;
  chunksCount: number;
}

const KnowledgeDocSchema = new Schema<IKnowledgeDoc>({
  name: { type: String, required: true },
  size: { type: String, default: '1.0 MB' },
  type: { type: String, enum: ['pdf', 'docx', 'txt', 'url'], default: 'pdf' },
  status: { type: String, enum: ['trained', 'processing', 'failed'], default: 'trained' },
  trainedAt: { type: String, default: 'Vừa xong' },
  chunksCount: { type: Number, default: 50 }
});

export const KnowledgeDoc = mongoose.model<IKnowledgeDoc>('KnowledgeDoc', KnowledgeDocSchema);
