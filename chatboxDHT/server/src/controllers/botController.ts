import { Request, Response } from 'express';
import { getBotFlowData, saveBotFlowData } from '../services/botService';

export const getBotFlow = async (_req: Request, res: Response) => {
  try {
    const flow = await getBotFlowData();
    return res.json({ success: true, data: flow });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const saveBotFlow = async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    const flow = await saveBotFlowData(payload);
    return res.json({ success: true, data: flow, message: 'Đã lưu cấu hình Bot AI' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
