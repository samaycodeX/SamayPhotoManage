import { Workflow, WORKFLOW_STEPS } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createWorkflow = asyncHandler(async (req, res) => {
  const existing = await Workflow.findOne({ customer: req.body.customer });
  if (existing) return res.status(409).json({ message: 'Workflow already exists for this customer' });

  const workflow = await Workflow.create({
    customer: req.body.customer,
    steps: WORKFLOW_STEPS.map((name) => ({ name })),
  });
  res.status(201).json(workflow);
});

export const updateWorkflow = asyncHandler(async (req, res) => {
  const workflow = await Workflow.findByIdAndUpdate(
    req.params.id,
    { steps: req.body.steps },
    { new: true, runValidators: true }
  );
  if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
  res.json(workflow);
});
