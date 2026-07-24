import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const customerSchema = new Schema(
  {
    customerName: { type: String, required: true, trim: true },
    mobileNumber: { type: String, required: true, trim: true, index: true },
    whatsappNumber: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true },
    packageAmount: { type: Number, required: true, min: 0, immutable: true },
    services: { type: [String], default: [] },
    deliverables: { type: [String], default: [] },
    deliverableNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

export const Customer = model('Customer', customerSchema);
