import { Event } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function assignFirstEventAsMain(customer) {
  const mainEvent = await Event.findOne({ customer, isMainEvent: true });
  if (mainEvent) return mainEvent;

  const firstEvent = await Event.findOne({ customer }).sort({ createdAt: 1, _id: 1 });
  if (!firstEvent) return null;

  await Event.updateOne({ _id: firstEvent._id }, { isMainEvent: true });
  return firstEvent;
}

export const listEvents = asyncHandler(async (req, res) => {
  const { customer, page = 1, limit = 50, sort = 'createdAt' } = req.query;
  const query = customer ? { customer } : {};

  if (customer) await assignFirstEventAsMain(customer);

  const [data, total] = await Promise.all([
    Event.find(query).sort(sort).skip((page - 1) * limit).limit(+limit),
    Event.countDocuments(query),
  ]);

  res.json({ data, total, page: +page, pages: Math.ceil(total / limit) || 1 });
});

export const createEvent = asyncHandler(async (req, res) => {
  const { customer, isMainEvent, ...eventData } = req.body;
  await assignFirstEventAsMain(customer);

  const hasEvents = await Event.exists({ customer });
  const shouldBeMain = isMainEvent === true || !hasEvents;

  if (shouldBeMain) await Event.updateMany({ customer }, { isMainEvent: false });

  const event = await Event.create({ customer, ...eventData, isMainEvent: shouldBeMain });
  res.status(201).json(event);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const { isMainEvent, ...eventData } = req.body;

  if (isMainEvent === true) {
    await Event.updateMany({ customer: event.customer, _id: { $ne: event._id } }, { isMainEvent: false });
    event.isMainEvent = true;
  } else if (isMainEvent === false && event.isMainEvent) {
    const replacement = await Event.findOne({ customer: event.customer, _id: { $ne: event._id } })
      .sort({ createdAt: 1, _id: 1 });
    if (replacement) {
      replacement.isMainEvent = true;
      await replacement.save();
      event.isMainEvent = false;
    }
  }

  Object.assign(event, eventData);
  await event.save();
  await assignFirstEventAsMain(event.customer);
  res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  const { customer, isMainEvent } = event;
  await event.deleteOne();
  if (isMainEvent) await assignFirstEventAsMain(customer);

  res.status(204).end();
});

export async function ensureMainEvents(customers) {
  await Promise.all(customers.map((customer) => assignFirstEventAsMain(customer._id)));
}
