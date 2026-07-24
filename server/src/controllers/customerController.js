import {
  Customer,
  Event,
  Service,
  Deliverable,
  Payment,
  Expense,
  Workflow,
} from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureMainEvents } from './eventController.js';

export const listCustomers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', sort = '-createdAt' } = req.query;

  const query = search
    ? {
        $or: ['customerName', 'mobileNumber'].map((field) => ({
          [field]: { $regex: search, $options: 'i' },
        })),
      }
    : {};

  const [customers, total] = await Promise.all([
    Customer.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(+limit),
    Customer.countDocuments(query),
  ]);

  await ensureMainEvents(customers);
  const customerIds = customers.map((customer) => customer._id);
  const mainEvents = await Event.find({ customer: { $in: customerIds }, isMainEvent: true })
    .select('customer type date')
    .lean();
  const mainEventByCustomer = new Map(mainEvents.map((event) => [String(event.customer), event]));
  const data = customers.map((customer) => {
    const mainEvent = mainEventByCustomer.get(String(customer._id));
    return {
      ...customer.toObject(),
      mainEvent: mainEvent && { eventName: mainEvent.type, eventDate: mainEvent.date },
    };
  });

  res.json({ data, total, page: +page, pages: Math.ceil(total / limit) || 1 });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
});

export const createCustomer = asyncHandler(async (req, res) => {
  const { customer: customerData, events, services, deliverables, deliverableNotes, payments, expenses } = req.body;
  let customer;

  try {
    // This deliberately avoids MongoDB transactions: the documented local
    // connection string targets a standalone MongoDB instance, where
    // transactions are unsupported. Validation has already run, and the
    // catch block below removes any partial booking if a child write fails.
    customer = await Customer.create({ ...customerData, services, deliverables, deliverableNotes });
    const customerId = customer._id;
    const mainEventIndex = events.findIndex((event) => event.isMainEvent);
    const normalizedEvents = events.map((event, index) => ({
      ...event,
      customer: customerId,
      isMainEvent: index === (mainEventIndex >= 0 ? mainEventIndex : 0),
    }));

    if (normalizedEvents.length) await Event.insertMany(normalizedEvents);
    if (payments.length) await Payment.insertMany(payments.map((item) => ({ ...item, customer: customerId })));
    if (expenses.length) await Expense.insertMany(expenses.map((item) => ({ ...item, customer: customerId })));

    res.status(201).json(customer);
  } catch (err) {
    if (customer?._id) {
      await Promise.all([
        Event.deleteMany({ customer: customer._id }),
        Payment.deleteMany({ customer: customer._id }),
        Expense.deleteMany({ customer: customer._id }),
        Customer.deleteOne({ _id: customer._id }),
      ]);
    }
    throw err;
  }
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  res.json(customer);
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  // Cascade: a customer's child records are meaningless without the parent.
  const id = req.params.id;
  await Promise.all([
    Event.deleteMany({ customer: id }),
    Service.deleteMany({ customer: id }),
    Deliverable.deleteMany({ customer: id }),
    Payment.deleteMany({ customer: id }),
    Expense.deleteMany({ customer: id }),
    Workflow.deleteOne({ customer: id }),
  ]);

  res.status(204).end();
});

export const getCustomerOverview = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const [customer, payments, expenses, workflow] =
    await Promise.all([
      Customer.findById(id),
      Payment.find({ customer: id }).sort('-date'),
      Expense.find({ customer: id }).sort('-date'),
      Workflow.findOne({ customer: id }),
    ]);

  if (!customer) return res.status(404).json({ message: 'Customer not found' });

  await ensureMainEvents([customer]);
  const normalizedEvents = await Event.find({ customer: id }).sort({ createdAt: 1, _id: 1 });

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalBilled = customer.packageAmount ?? 0;
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  res.json({
    customer,
    events: normalizedEvents,
    services: customer.services || [],
    deliverables: customer.deliverables || [],
    payments,
    expenses,
    workflow,
    totals: {
      totalBilled,
      totalPaid,
      remainingDue: Math.max(0, totalBilled - totalPaid),
      totalExpense,
    },
  });
});
