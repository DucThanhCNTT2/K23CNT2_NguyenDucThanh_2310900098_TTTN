import { Router } from 'express';
import { getWidgetMessages, sendWidgetMessage } from '../controllers/widgetController';

const router = Router();
router.get('/messages', getWidgetMessages);
router.post('/send', sendWidgetMessage);

export default router;
