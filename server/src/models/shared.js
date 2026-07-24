import mongoose from 'mongoose';

/**
 * Every child collection (events, services, deliverables, payments,
 * expenses, workflow) belongs to exactly one Customer. Sharing this
 * field definition keeps the relationship consistent everywhere.
 */
export const customerRef = {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Customer',
  required: true,
  index: true,
};
