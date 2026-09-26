import { Router } from 'express';
import { 
  getFAQs, 
  createFAQ, 
  deleteFAQ, 
  getDocs, 
  addDoc 
} from '../controllers/knowledgeController';

const router = Router();

router.get('/faqs', getFAQs);
router.post('/faqs', createFAQ);
router.delete('/faqs/:id', deleteFAQ);

router.get('/docs', getDocs);
router.post('/docs', addDoc);

export default router;
