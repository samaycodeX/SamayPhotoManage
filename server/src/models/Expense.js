import mongoose from 'mongoose';
import { customerRef } from './shared.js';

const { Schema, model } = mongoose;

export const EXPENSE_CATEGORIES = [
  'Travel',
  'Team',
  'Food',
  'Hotel',
  'Editing',
  'Album',
  'Frame',
  'Other',
];

const expenseSchema = new Schema(
  {
    customer: customerRef,
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    amount: { type: Number, min: 0, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Expense = model('Expense', expenseSchema);
