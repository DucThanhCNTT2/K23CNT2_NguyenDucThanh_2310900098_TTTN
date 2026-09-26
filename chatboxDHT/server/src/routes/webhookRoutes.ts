import { Router } from 'express';
import { 
  verifyFacebookWebhook, 
  receiveFacebookWebhook, 
  receiveZaloWebhook 
} from '../controllers/webhookController';

const router = Router();

// Facebook Messenger
router.get('/facebook', verifyFacebookWebhook);
router.post('/facebook', receiveFacebookWebhook);

// Zalo OA
router.post('/zalo', receiveZaloWebhook);

export default router;
