import { NextFunction, Request, Response } from 'express';
import { User } from '../models';
import { verifyAccessToken } from './utils';

export async function authenticateToken(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    (req as any).user = null;
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    (req as any).user = user || null;
  } catch {
    (req as any).user = null;
  }

  return next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!((req as any).user && (req as any).user.role === 'admin')) {
    return res.status(403).json({ success: false, message: 'Rất tiếc! Chỉ tài khoản Admin mới có quyền thực hiện thao tác này.' });
  }
  return next();
}
