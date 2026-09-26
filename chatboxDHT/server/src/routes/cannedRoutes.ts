import { Router } from 'express';
import { createCannedResponse, getCannedResponses } from '../controllers/cannedController';

const router = Router();
router.get('/', getCannedResponses);
router.post('/', createCannedResponse);

export default router;
