import { Router } from 'express';
import { verifyPin, summary } from '../controllers/financeController.js';
import { requireAuth, requireFinanceAccess } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { pinSchema } from '../utils/schemas.js';

const router = Router();

router.post('/verify-pin', requireAuth, validate(pinSchema), verifyPin);
router.get('/summary', requireAuth, requireFinanceAccess, summary);

export default router;
