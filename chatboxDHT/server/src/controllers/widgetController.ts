import { Request, Response } from 'express';
import { getSmartAIResponse } from '../services/aiService';

export async function sendWidgetMessage(req: Request, res: Response) {
  const content = String(req.body?.content || '').trim();
  if (!content) {
    return res.status(400).json({ success: false, message: 'Nội dung tin nhắn không được để trống.' });
  }

  try {
    const reply = await getSmartAIResponse(content);
    return res.json({ success: true, data: { reply } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
