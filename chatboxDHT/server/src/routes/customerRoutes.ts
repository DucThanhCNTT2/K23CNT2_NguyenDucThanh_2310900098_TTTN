import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  updateCustomer,
  mergeCustomerIdentities
} from '../controllers/customerController';

const router = Router();

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.put('/:id', updateCustomer);
router.post('/merge', mergeCustomerIdentities);

export default router;
