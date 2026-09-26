import { Request, Response } from 'express';
import { getAnalyticsData } from '../services/analyticsService';

export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    const data = await getAnalyticsData();
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
