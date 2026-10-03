import { Request, Response } from 'express';
import { Canned } from '../../models';
import { sendInternalServerError } from '../../httpErrors';

export async function getCannedResponses(_req: Request, res: Response) {
  try {
    const data = await Canned.find().sort({ createdAt: -1 });
    return res.json({ success: true, data });
  } catch (error) {
    return sendInternalServerError(res, error, 'List canned responses');
  }
}

export async function createCannedResponse(req: Request, res: Response) {
  try {
    const { shortcut, title, content, category } = req.body || {};
    if (!shortcut || !title || !content) {
      return res.status(400).json({ success: false, message: 'shortcut, title và content là bắt buộc.' });
    }
    const data = await Canned.create({ shortcut, title, content, category });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return sendInternalServerError(res, error, 'Create canned response');
  }
}
