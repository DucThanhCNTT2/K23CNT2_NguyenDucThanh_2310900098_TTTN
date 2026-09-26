import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

dotenv.config({ path: path.join(projectRoot, '.env') });

export const env = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dht_chatai',
  port: Number(process.env.PORT || 5000),
  resetPasswordExpiresMinutes: Number(process.env.RESET_PASSWORD_EXPIRES_MINUTES || 15),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dht-dev-access-secret-change-me',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dht-dev-refresh-secret-change-me',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
};
