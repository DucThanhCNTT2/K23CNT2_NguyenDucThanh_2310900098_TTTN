import { Request, Response } from 'express';
import { getAnalyticsData } from '../services/analyticsService';
import { sendInternalServerError } from '../../httpErrors';

export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    const data = await getAnalyticsData();
    return res.json({ success: true, data });
  } catch (error) {
    return sendInternalServerError(res, error, 'Analytics');
  }
};
