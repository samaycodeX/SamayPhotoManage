import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export const WORKFLOW_STEPS = [
  'PixStudio Upload',
  'Drive Upload',
  'Reel Uploaded',
  'Teaser Uploaded',
  'Highlight Uploaded',
  'Selection Completed',
  'Downloaded for Design',
  'Design Completed',
  'Sent for Approval',
  'Sent for Print',
  'Ready to Deliver',
  'Traditional Video Ready',
  'Delivered',
];

const stepSchema = new Schema(
  {
    name: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const workflowSchema = new Schema(
  {
    // `unique` creates the required index by itself.
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, unique: true },
    steps: { type: [stepSchema], default: () => WORKFLOW_STEPS.map((name) => ({ name })) },
  },
  { timestamps: true }
);

export const Workflow = model('Workflow', workflowSchema);
