import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { Server as SocketIOServer } from 'socket.io';
import { User } from './models';
import authRouter from './auth/routes';
import { authenticateToken, requireAuthenticated, requireStaff } from './auth/middleware';
import { verifyAccessToken } from './auth/utils';
import { env } from './config/env';
import { logInternalError, sendInternalServerError } from './httpErrors';
import { registerUserSocket, setRealtimeServer, unregisterUserSocket } from './realtime';
import { connectDB } from './src/config/db';
import analyticsRoutes from './src/routes/analyticsRoutes';
import botRoutes from './src/routes/botRoutes';
import cannedRoutes from './src/routes/cannedRoutes';
import conversationRoutes from './src/routes/conversationRoutes';
import healthRoutes from './src/routes/healthRoutes';
import knowledgeRoutes from './src/routes/knowledgeRoutes';
import webhookRoutes from './src/routes/webhookRoutes';
import widgetRoutes from './src/routes/widgetRoutes';
import channelConfigRoutes from './src/routes/channelConfigRoutes';
import customerRoutes from './src/routes/customerRoutes';
import testSuiteRoutes from './src/routes/testSuiteRoutes';
import { seedInitialUsers } from './src/services/seedService';
import path from 'path';

dotenv.config();

const app = express();

app.set('trust proxy', env.isProduction ? 1 : false);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https://images.unsplash.com',
        'https://api.vietqr.io',
        'https://lh3.googleusercontent.com',
        'https://platform-lookaside.fbsbx.com',
        'https://avatars.githubusercontent.com'
      ],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      connectSrc: ["'self'", 'https:', 'wss:'],
      ...(env.isProduction ? { upgradeInsecureRequests: [] } : {})
    }
  },
  hsts: env.isProduction ? { maxAge: 31_536_000, includeSubDomains: false } : false
}));

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
    if (!origin || env.corsAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buffer) => {
    if (req.url?.startsWith('/api/webhooks/facebook')) {
      Object.assign(req, { rawBody: Buffer.from(buffer) });
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(authRouter);
app.use('/api/health', healthRoutes);
app.use('/api/widget', widgetRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/conversations', authenticateToken, requireAuthenticated, conversationRoutes);
app.use('/api/bot', authenticateToken, requireAuthenticated, requireStaff, botRoutes);
app.use('/api/analytics', authenticateToken, requireAuthenticated, requireStaff, analyticsRoutes);
app.use('/api/knowledge', authenticateToken, requireAuthenticated, requireStaff, knowledgeRoutes);
app.use('/api/canned-responses', authenticateToken, requireAuthenticated, requireStaff, cannedRoutes);
app.use('/api/channel-config', authenticateToken, requireAuthenticated, requireStaff, channelConfigRoutes);
app.use('/api/customers', authenticateToken, requireAuthenticated, requireStaff, customerRoutes);
app.use('/api/test-suite', authenticateToken, requireAuthenticated, requireStaff, testSuiteRoutes);

// ==========================================
// KHỞI TẠO HTTP SERVER & SOCKET.IO
// ==========================================
const server = http.createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin: env.corsAllowedOrigins,
    methods: ['GET', 'POST']
  }
});
setRealtimeServer(io);

io.use(async (socket, next) => {
  try {
    const authToken = socket.handshake.auth.token;
    const header = socket.handshake.headers.authorization;
    const token = typeof authToken === 'string'
      ? authToken
      : header?.startsWith('Bearer ')
        ? header.slice(7)
        : undefined;
    if (!token) return next(new Error('Authentication required.'));

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (
      !user ||
      (user.tokenVersion ?? 0) !== payload.tokenVersion ||
      !['admin', 'agent', 'supervisor'].includes(user.role)
    ) {
      return next(new Error('Authentication required.'));
    }

    socket.data.userId = user._id.toString();
    socket.data.tokenExpiresAt = payload.exp * 1000;
    return next();
  } catch {
    return next(new Error('Authentication required.'));
  }
});

io.on('connection', (socket) => {
  const userId = String(socket.data.userId);
  registerUserSocket(userId, socket);
  const expiryTimer = setTimeout(
    () => socket.disconnect(true),
    Math.max(0, socket.data.tokenExpiresAt - Date.now())
  );
  expiryTimer.unref();
  socket.on('disconnect', () => {
    clearTimeout(expiryTimer);
    unregisterUserSocket(userId, socket);
  });
});

// ==========================================
// KHỞI TẠO SERVER & DATABASE
// ==========================================
export async function startServer() {
  await connectDB();
  if (mongoose.connection.readyState === 1) {
    try {
      await seedInitialUsers();
    } catch (error) {
      logInternalError(error, 'Initial user seeding');
      if (process.env.NODE_ENV === 'production') {
        throw error;
      }
    }
  }

  server.listen(env.port, '0.0.0.0', () => {
    console.log(`🚀 [DHT ChatAI Backend] Running on port ${env.port}`);
  });
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');
app.use(express.static(distDir));
app.get(/^(?!\/api(?:\/|$)\vert{}\/socket\.io(?:\/\vert{}$)).*/, (_req, res, next) => {
  res.sendFile(path.join(distDir, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(error);
  if (error instanceof Error && error.message === 'Origin is not allowed by CORS.') {
    return res.status(403).json({ success: false, message: 'Origin is not allowed.' });
  }
  return sendInternalServerError(res, error, 'Unhandled request');
});

export { app };
export default app;