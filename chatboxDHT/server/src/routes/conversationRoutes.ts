import { Router } from 'express';
import { 
  getConversations, 
  getMessages, 
  sendMessage, 
  getOrCreateUserConversation,
  toggleBotSwitch, 
  submitRating 
} from '../controllers/conversationController';
import { requireStaff } from '../../auth/middleware';

const router = Router();

router.get('/', requireStaff, getConversations);
router.post('/user-session', getOrCreateUserConversation);
router.get('/:conversationId/messages', getMessages);
router.post('/:conversationId/messages', sendMessage);
router.post('/:conversationId/toggle-bot', requireStaff, toggleBotSwitch);
router.post('/:conversationId/rating', submitRating);

export default router;
