import { Router } from 'express';
import { sendWidgetMessage } from '../controllers/widgetController';

const router = Router();
router.post('/send', sendWidgetMessage);

export default router;
