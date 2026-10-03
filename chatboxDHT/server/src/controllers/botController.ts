import { Request, Response } from 'express';
import { getBotFlowData, saveBotFlowData } from '../services/botService';
import { sendInternalServerError } from '../../httpErrors';

export const getBotFlow = async (_req: Request, res: Response) => {
  try {
    const flow = await getBotFlowData();
    return res.json({ success: true, data: flow });
  } catch (error) {
    return sendInternalServerError(res, error, 'Get bot flow');
  }
};

export const saveBotFlow = async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    const flow = await saveBotFlowData(payload);
    return res.json({ success: true, data: flow, message: 'Đã lưu cấu hình Bot AI' });
  } catch (error) {
    return sendInternalServerError(res, error, 'Save bot flow');
  }
};
