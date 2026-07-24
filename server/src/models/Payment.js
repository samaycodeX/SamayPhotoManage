import mongoose from 'mongoose';
import { customerRef } from './shared.js';

const { Schema, model } = mongoose;

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Other'];

const paymentSchema = new Schema(
  {
    customer: customerRef,
    amount: { type: Number, min: 0, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, enum: PAYMENT_METHODS, default: 'Cash' },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Payment = model('Payment', paymentSchema);
