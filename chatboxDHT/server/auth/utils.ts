import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyAccessToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwtAccessSecret) as { sub: string };
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.jwtRefreshSecret) as { sub: string };
}
