import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from './config/db';

import conversationRoutes from './routes/conversationRoutes';
import webhookRoutes from './routes/webhookRoutes';
import botRoutes from './routes/botRoutes';
import knowledgeRoutes from './routes/knowledgeRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { authenticateToken, requireAuthenticated, requireStaff } from '../auth/middleware';
import { env } from '../config/env';
import { sendInternalServerError } from '../httpErrors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.set('trust proxy', env.isProduction ? 1 : false);
app.use(helmet({ hsts: env.isProduction ? { maxAge: 31_536_000, includeSubDomains: false } : false }));
app.use((req, res, next) => {
  if (env.isProduction && !req.secure) {
    const publicUrl = new URL(env.publicUrl);
    const destination = new URL(req.originalUrl, publicUrl);
    if (destination.origin !== publicUrl.origin) return res.sendStatus(400);
    return res.redirect(308, destination.toString());
  }
  return next();
});
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.corsAllowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Health Check
app.get('/api/health', (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  res.status(!databaseConnected && env.isProduction ? 503 : 200).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/conversations', authenticateToken, requireAuthenticated, requireStaff, conversationRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/bot', authenticateToken, requireAuthenticated, requireStaff, botRoutes);
app.use('/api/knowledge', authenticateToken, requireAuthenticated, requireStaff, knowledgeRoutes);
app.use('/api/analytics', authenticateToken, requireAuthenticated, requireStaff, analyticsRoutes);

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(error);
  if (error instanceof Error && error.message === 'Origin is not allowed by CORS.') {
    return res.status(403).json({ success: false, message: 'Origin is not allowed.' });
  }
  return sendInternalServerError(res, error, 'Unhandled request');
});

app.listen(PORT, () => {
  console.log(`🚀 [DHT ChatAI Backend] Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📡 [API Health Check]: http://localhost:${PORT}/api/health`);
});
