import { Router } from 'express';
import { 
  verifyFacebookWebhook, 
  receiveFacebookWebhook, 
  verifyZaloWebhook,
  receiveZaloWebhook 
} from '../controllers/webhookController';

const router = Router();

// Facebook Messenger
router.get('/facebook', verifyFacebookWebhook);
router.post('/facebook', receiveFacebookWebhook);

// Zalo OA
router.get('/zalo', verifyZaloWebhook);
router.post('/zalo', receiveZaloWebhook);

export default router;
