import { Router } from 'express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  toggleBotSwitch, 
  submitRating 
} from '../controllers/conversationController';

const router = Router();

router.get('/', getConversations);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);
router.post('/:conversationId/toggle-bot', toggleBotSwitch);
router.post('/:conversationId/rating', submitRating);

export default router;
