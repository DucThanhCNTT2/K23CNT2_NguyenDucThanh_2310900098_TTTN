import crypto from 'node:crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(password: string, storedHash: string): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (/^[a-f\d]{64}$/i.test(storedHash)) {
    const actual = crypto.createHash('sha256').update(password).digest();
    const expected = Buffer.from(storedHash, 'hex');
    return {
      valid: actual.length === expected.length && crypto.timingSafeEqual(actual, expected),
      needsRehash: true
    };
  }

  if (!storedHash.startsWith('$argon2id$')) {
    return { valid: false, needsRehash: false };
  }

  return {
    valid: await argon2.verify(storedHash, password),
    needsRehash: argon2.needsRehash(storedHash)
  };
}

export function hashOneTimeSecret(value: string): string {
  return crypto.createHmac('sha256', env.jwtRefreshSecret).update(value).digest('hex');
}

export function generateToken(userId: string, tokenVersion = 0): string {
  return jwt.sign(
    { sub: userId, tokenVersion },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function generateRefreshToken(userId: string, tokenVersion = 0): string {
  return jwt.sign(
    { sub: userId, tokenVersion, type: 'refresh' },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

export function verifyAccessToken(token: string): { sub: string; tokenVersion: number; exp: number } {
  const payload = jwt.verify(token, env.jwtAccessSecret);
  if (
    typeof payload === 'string' ||
    typeof payload.sub !== 'string' ||
    typeof payload.exp !== 'number' ||
    (payload.tokenVersion !== undefined && typeof payload.tokenVersion !== 'number')
  ) {
    throw new Error('Invalid access token payload.');
  }

  return {
    sub: payload.sub,
    tokenVersion: payload.tokenVersion ?? 0,
    exp: payload.exp
  };
}

export function verifyRefreshToken(token: string): { sub: string; tokenVersion: number } {
  const payload = jwt.verify(token, env.jwtRefreshSecret);
  if (
    typeof payload === 'string' ||
    typeof payload.sub !== 'string' ||
    payload.type !== 'refresh' ||
    (payload.tokenVersion !== undefined && typeof payload.tokenVersion !== 'number')
  ) {
    throw new Error('Invalid refresh token payload.');
  }
  return { sub: payload.sub, tokenVersion: payload.tokenVersion ?? 0 };
}
