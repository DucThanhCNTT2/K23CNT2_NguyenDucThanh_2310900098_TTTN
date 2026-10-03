import mongoose from 'mongoose';
import { env } from '../../config/env';
import { logInternalError } from '../../httpErrors';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ [MongoDB] Kết nối cơ sở dữ liệu thành công: ${conn.connection.host}`);
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    logInternalError(error, 'MongoDB connection');
    console.warn('MongoDB unavailable; using development mock data.');
  }
};
