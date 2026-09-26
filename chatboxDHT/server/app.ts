import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import authRouter from './auth/routes';
import { authenticateToken, requireAdmin } from './auth/middleware';
import { env } from './config/env';
import { connectDB } from './src/config/db';
import analyticsRoutes from './src/routes/analyticsRoutes';
import botRoutes from './src/routes/botRoutes';
import cannedRoutes from './src/routes/cannedRoutes';
import conversationRoutes from './src/routes/conversationRoutes';
import healthRoutes from './src/routes/healthRoutes';
import knowledgeRoutes from './src/routes/knowledgeRoutes';
import webhookRoutes from './src/routes/webhookRoutes';
import widgetRoutes from './src/routes/widgetRoutes';
import { seedInitialUsers } from './src/services/seedService';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(authRouter);
app.use('/api/health', healthRoutes);
app.use('/api/widget', widgetRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/conversations', authenticateToken, conversationRoutes);
app.use('/api/bot', authenticateToken, botRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/knowledge', authenticateToken, knowledgeRoutes);
app.use('/api/canned-responses', authenticateToken, cannedRoutes);

async function startServer() {
  await connectDB();
  if (mongoose.connection.readyState === 1) {
    try {
      await seedInitialUsers();
    } catch (error: any) {
      console.error(`❌ [Seed Data Failed]: ${error.message}`);
    }
  }

  app.listen(env.port, () => {
    console.log(`🚀 [DHT ChatAI Backend] Running at http://localhost:${env.port}`);
  });
}

startServer().catch((error: any) => {
  console.error(`❌ [Backend Startup Failed]: ${error.message}`);
  process.exitCode = 1;
});

export { app };
export default app;
