import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dht_chatai';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ [MongoDB] Kết nối cơ sở dữ liệu thành công: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`⚠️ [MongoDB] Chưa thể kết nối tới MongoDB (${error.message}). Hệ thống sẽ chuyển sang chế độ In-Memory Mock Data.`);
  }
};
