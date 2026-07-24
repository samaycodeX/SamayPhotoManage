import mongoose from 'mongoose';
import { customerRef } from './shared.js';

const { Schema, model } = mongoose;

export const DELIVERABLE_TYPES = [
  'Wedding Album',
  'Engagement Album',
  'Traditional Video',
  'Cinematic Film',
  'Instagram Reel',
  'Teaser',
  'Highlight',
  'Pendrive',
  'Frame',
  'Extra Sheets',
  'Raw Data',
];

export const DELIVERABLE_STATUSES = ['Pending', 'Working', 'Ready', 'Delivered'];

const deliverableSchema = new Schema(
  {
    customer: customerRef,
    name: { type: String, enum: DELIVERABLE_TYPES, required: true },
    status: { type: String, enum: DELIVERABLE_STATUSES, default: 'Pending' },
    dueDate: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Deliverable = model('Deliverable', deliverableSchema);
