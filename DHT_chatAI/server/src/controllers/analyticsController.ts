import { Request, Response } from 'express';
import { analyticsData } from '../../../src/mock/data';

export const getAnalytics = (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: analyticsData
  });
};
