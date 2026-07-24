import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import customerRoutes from './customers.routes.js';
import recordRoutes from './records.routes.js';
import financeRoutes from './finance.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/customers', customerRoutes);
router.use('/finance', financeRoutes);
router.use('/', recordRoutes); // events, services, deliverables, payments, expenses, workflow

export default router;
