import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { FAQ, KnowledgeDoc } from '../models/Knowledge';
import { sampleFAQs, sampleKnowledgeDocs } from '../../../src/mock/data';
import { sendInternalServerError } from '../../httpErrors';

let memoryFaqs = [...sampleFAQs];
let memoryDocs = [...sampleKnowledgeDocs];

// FAQs
export const getFAQs = async (_req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const list = await FAQ.find().sort({ updatedAt: -1 });
      return res.json({ success: true, data: list });
    }
    return res.json({ success: true, data: memoryFaqs });
  } catch (error) {
    return sendInternalServerError(res, error, 'List FAQs');
  }
};

export const createFAQ = async (req: Request, res: Response) => {
  try {
    const { question, answer, category } = req.body;
    const item = {
      id: 'faq_' + Date.now(),
      question,
      answer,
      category: category || 'Chung',
      updatedAt: 'Hôm nay'
    };

    if (mongoose.connection.readyState === 1) {
      await FAQ.create(item);
    }
    memoryFaqs.unshift(item as any);
    return res.json({ success: true, data: item });
  } catch (error) {
    return sendInternalServerError(res, error, 'Create FAQ');
  }
};

export const deleteFAQ = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      await FAQ.findByIdAndDelete(id);
    }
    memoryFaqs = memoryFaqs.filter(f => f.id !== id);
    return res.json({ success: true, message: 'Đã xóa FAQ' });
  } catch (error) {
    return sendInternalServerError(res, error, 'Delete FAQ');
  }
};

// Documents
export const getDocs = async (_req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const list = await KnowledgeDoc.find().sort({ trainedAt: -1 });
      return res.json({ success: true, data: list });
    }
    return res.json({ success: true, data: memoryDocs });
  } catch (error) {
    return sendInternalServerError(res, error, 'List knowledge documents');
  }
};

export const addDoc = async (req: Request, res: Response) => {
  try {
    const { name, size, type } = req.body;
    const doc = {
      id: 'doc_' + Date.now(),
      name,
      size: size || '1.0 MB',
      type: type || 'pdf',
      status: 'trained' as const,
      trainedAt: 'Vừa xong',
      chunksCount: Math.floor(Math.random() * 80) + 40
    };

    if (mongoose.connection.readyState === 1) {
      await KnowledgeDoc.create(doc);
    }
    memoryDocs.unshift(doc as any);
    return res.json({ success: true, data: doc });
  } catch (error) {
    return sendInternalServerError(res, error, 'Add knowledge document');
  }
};
