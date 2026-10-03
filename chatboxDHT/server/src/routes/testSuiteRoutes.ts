import { Router } from 'express';
import {
  testIntentAccuracy,
  testCustomQuery,
  testChannelResponseTime,
  testErrorSimulation,
  getSecurityAuditStatus
} from '../controllers/testSuiteController';

const router = Router();

router.get('/intent-accuracy', testIntentAccuracy);
router.post('/query', testCustomQuery);
router.post('/response-time', testChannelResponseTime);
router.post('/simulate-error', testErrorSimulation);
router.get('/security-audit', getSecurityAuditStatus);

export default router;
