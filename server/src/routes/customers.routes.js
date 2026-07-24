import { Router } from 'express';
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOverview,
} from '../controllers/customerController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { bookingSchema, customerUpdateSchema } from '../utils/schemas.js';

const router = Router();

router.use(requireAuth);

router.get('/', listCustomers);
router.post('/', validate(bookingSchema), createCustomer);
router.get('/:id', getCustomer);
router.get('/:id/overview', getCustomerOverview);
router.patch('/:id', validate(customerUpdateSchema), updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;
