import { Router } from 'express';
import {
  getChannelConfigs,
  updateChannelConfig,
  testChannelConnection,
  simulateChannelMessage
} from '../controllers/channelConfigController';

const router = Router();

router.get('/', getChannelConfigs);
router.put('/:channel', updateChannelConfig);
router.post('/test-connection/:channel', testChannelConnection);
router.post('/simulate-message', simulateChannelMessage);

export default router;
