import { z } from 'zod';
import { EVENT_TYPES } from '../models/Event.js';
import { SERVICE_TYPES } from '../models/Service.js';
import { DELIVERABLE_TYPES, DELIVERABLE_STATUSES } from '../models/Deliverable.js';
import { PAYMENT_METHODS } from '../models/Payment.js';
import { EXPENSE_CATEGORIES } from '../models/Expense.js';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const pinSchema = z.object({
  pin: z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
});

export const customerSchema = z.object({
  customerName: z.string().min(1),
  mobileNumber: z.string().min(6),
  address: z.string().optional(),
});

export const customerUpdateSchema = customerSchema.partial().extend({
  services: z.array(z.enum(SERVICE_TYPES)).optional(),
  deliverables: z.array(z.enum(DELIVERABLE_TYPES)).optional(),
  deliverableNotes: z.string().optional(),
});

export const eventSchema = z.object({
  customer: z.string(),
  type: z.enum(EVENT_TYPES),
  date: z.coerce.date(),
  isMainEvent: z.boolean().optional(),
  time: z.string().optional(),
  venue: z.string().optional(),
  endTime: z.string().optional(),
  googleMapLink: z.string().url().optional().or(z.literal('')),
});

export const eventUpdateSchema = eventSchema.omit({ customer: true }).partial();

export const deliverableSchema = z.object({
  customer: z.string(),
  name: z.enum(DELIVERABLE_TYPES),
  status: z.enum(DELIVERABLE_STATUSES).optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const paymentSchema = z.object({
  customer: z.string(),
  amount: z.coerce.number().min(0),
  date: z.coerce.date().optional(),
  method: z.enum(PAYMENT_METHODS).optional(),
  notes: z.string().optional(),
});

export const expenseSchema = z.object({
  customer: z.string(),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.coerce.number().min(0),
  date: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const paymentUpdateSchema = paymentSchema.omit({ customer: true }).partial();
export const expenseUpdateSchema = expenseSchema.omit({ customer: true }).partial();

export const bookingSchema = z.object({
  customer: z.object({
    customerName: z.string().min(1),
    mobileNumber: z.string().min(6),
    whatsappNumber: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    reference: z.string().optional(),
    notes: z.string().optional(),
    packageAmount: z.coerce.number().min(0),
  }),
  events: z.array(eventSchema.omit({ customer: true })).default([]),
  services: z.array(z.enum(SERVICE_TYPES)).default([]),
  deliverables: z.array(z.enum(DELIVERABLE_TYPES)).default([]),
  deliverableNotes: z.string().optional(),
  payments: z.array(paymentSchema.omit({ customer: true })).default([]),
  expenses: z.array(expenseSchema.omit({ customer: true })).default([]),
});
