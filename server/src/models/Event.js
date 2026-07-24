import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const EVENT_TYPES = [
  'Wedding',
  'Engagement',
  'Haldi',
  'Mehendi',
  'Reception',
  'Birthday',
  'Baby Shower',
  'Pre Wedding',
  'Other',
];

const eventSchema = new Schema(
  {
    // The partial unique index below is the only customer index this model
    // needs; a second ordinary index would be redundant.
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    type: { type: String, enum: EVENT_TYPES, required: true },
    date: { type: Date, required: true, index: true },
    isMainEvent: { type: Boolean, default: false, index: true },
    time: { type: String, trim: true },
    endTime: { type: String, trim: true },
    venue: { type: String, trim: true },
    googleMapLink: { type: String, trim: true },
  },
  { timestamps: true }
);

// MongoDB enforces the one-main-event rule even if two requests arrive together.
eventSchema.index(
  { customer: 1 },
  { unique: true, partialFilterExpression: { isMainEvent: true } }
);

export const Event = model('Event', eventSchema);
