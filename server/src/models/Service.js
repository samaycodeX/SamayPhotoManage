import mongoose from 'mongoose';
import { customerRef } from './shared.js';

const { Schema, model } = mongoose;

export const SERVICE_TYPES = [
  'Photography',
  'Videography',
  'Candid',
  'Drone',
  'Cinematic',
  'Reel',
  'Pre Wedding',
  'Traditional Video',
  'Live Streaming',
  'Album',
  'Frame',
  'LED',
  'Other',
];

const serviceSchema = new Schema(
  {
    customer: customerRef,
    name: { type: String, enum: SERVICE_TYPES, required: true },
    price: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Service = model('Service', serviceSchema);
