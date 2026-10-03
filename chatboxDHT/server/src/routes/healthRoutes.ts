import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (_req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  const status = databaseConnected ? 'ok' : 'unavailable';
  res.status(!databaseConnected && process.env.NODE_ENV === 'production' ? 503 : 200).json({
    status,
    timestamp: new Date().toISOString()
  });
});

export default router;
