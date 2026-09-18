import { Router } from 'express';
import { getBotFlow, saveBotFlow } from '../controllers/botController';

const router = Router();

router.get('/flow', getBotFlow);
router.post('/flow', saveBotFlow);

export default router;
