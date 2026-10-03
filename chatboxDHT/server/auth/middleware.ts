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

  let payload: ReturnType<typeof verifyAccessToken>;
  try {
    payload = verifyAccessToken(token);
  } catch {
    (req as any).user = null;
    return next();
  }

  const user = await User.findById(payload.sub);
  (req as any).user = user && (user.tokenVersion ?? 0) === payload.tokenVersion ? user : null;
  return next();
}

export function requireAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để tiếp tục.' });
  }
  return next();
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  const role = (req as any).user?.role;
  if (!['admin', 'agent', 'supervisor'].includes(role)) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền thực hiện thao tác này.' });
  }
  return next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!((req as any).user && (req as any).user.role === 'admin')) {
    return res.status(403).json({ success: false, message: 'Rất tiếc! Chỉ tài khoản Admin mới có quyền thực hiện thao tác này.' });
  }
  return next();
}
