import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db';

import conversationRoutes from './routes/conversationRoutes';
import webhookRoutes from './routes/webhookRoutes';
import botRoutes from './routes/botRoutes';
import knowledgeRoutes from './routes/knowledgeRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'in-memory-fallback',
    channels: ['website', 'facebook_messenger', 'zalo_oa']
  });
});

// API Routes
app.use('/api/conversations', conversationRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/analytics', analyticsRoutes);

app.listen(PORT, () => {
  console.log(`🚀 [DHT ChatAI Backend] Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📡 [API Health Check]: http://localhost:${PORT}/api/health`);
});
