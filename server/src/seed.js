import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import {
  Customer,
  Event,
  Payment,
  Expense,
  Workflow,
  WORKFLOW_STEPS,
} from './models/index.js';

/**
 * Populates the database with one realistic demo customer and all related
 * records, so a fresh clone has something to look at immediately.
 * Run with: npm run seed
 */
async function seed() {
  await connectDB();

  const customer = await Customer.create({
    customerName: 'Rahul & Priya Wedding',
    mobileNumber: '9876543210',
    address: 'Bhopal, Madhya Pradesh',
    packageAmount: 105000,
    services: ['Photography', 'Cinematic'],
    deliverables: ['Wedding Album', 'Highlight'],
  });

  await Event.create([
    { customer: customer._id, type: 'Haldi', date: new Date(Date.now() + 2 * 86400000), time: '10:00 AM', venue: 'Home', isMainEvent: true },
    { customer: customer._id, type: 'Wedding', date: new Date(Date.now() + 5 * 86400000), time: '7:00 PM', venue: 'Grand Palace Lawns' },
  ]);

  await Payment.create([{ customer: customer._id, amount: 50000, method: 'UPI' }]);
  await Expense.create([{ customer: customer._id, category: 'Travel', amount: 3000 }]);

  await Workflow.create({
    customer: customer._id,
    steps: WORKFLOW_STEPS.map((name) => ({ name })),
  });

  console.log('[seed] Demo customer and related records created.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
