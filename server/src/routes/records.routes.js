import { Router } from 'express';
import { Payment, Expense } from '../models/index.js';
import { createResourceController } from '../controllers/resourceController.js';
import { createEvent, deleteEvent, listEvents, updateEvent } from '../controllers/eventController.js';
import { createWorkflow, updateWorkflow } from '../controllers/workflowController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  eventSchema,
  eventUpdateSchema,
  paymentSchema,
  paymentUpdateSchema,
  expenseSchema,
  expenseUpdateSchema,
} from '../utils/schemas.js';

const router = Router();
router.use(requireAuth);

router.get('/events', listEvents);
router.post('/events', validate(eventSchema), createEvent);
router.patch('/events/:id', validate(eventUpdateSchema), updateEvent);
router.delete('/events/:id', deleteEvent);

const resources = [
  { path: 'payments', Model: Payment, schema: paymentSchema, updateSchema: paymentUpdateSchema },
  { path: 'expenses', Model: Expense, schema: expenseSchema, updateSchema: expenseUpdateSchema },
];

for (const { path, Model, schema, updateSchema } of resources) {
  const { list, create, update, remove } = createResourceController(Model);
  router.get(`/${path}`, list);
  router.post(`/${path}`, validate(schema), create);
  router.patch(`/${path}/:id`, validate(updateSchema), update);
  router.delete(`/${path}/:id`, remove);
}

// Workflow is a single embedded-steps document per customer, so it gets
// its own two routes instead of the generic CRUD set above.
router.post('/workflow', createWorkflow);
router.patch('/workflow/:id', updateWorkflow);

export default router;
