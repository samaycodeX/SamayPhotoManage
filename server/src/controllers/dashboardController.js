import { Customer, Event, Deliverable } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Builds a lightweight, non-financial activity feed by merging the most
 * recent customer, event, and deliverable changes. Payment amounts are
 * intentionally omitted here since the dashboard must stay finance-free.
 */
async function getRecentActivities() {
  const [customers, events, deliverables] = await Promise.all([
    Customer.find().sort('-createdAt').limit(5).select('customerName createdAt'),
    Event.find().sort('-createdAt').limit(5).populate('customer', 'customerName'),
    Deliverable.find().sort('-updatedAt').limit(5).populate('customer', 'customerName'),
  ]);

  const activities = [
    ...customers.map((c) => ({
      type: 'customer',
      message: `New customer added: ${c.customerName}`,
      at: c.createdAt,
    })),
    ...events.map((e) => ({
      type: 'event',
      message: `${e.type} scheduled for ${e.customer?.customerName || 'a customer'}`,
      at: e.createdAt,
    })),
    ...deliverables.map((d) => ({
      type: 'deliverable',
      message: `${d.name} marked "${d.status}" for ${d.customer?.customerName || 'a customer'}`,
      at: d.updatedAt,
    })),
  ];

  return activities.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);
}

export const getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(+startOfToday + 24 * 60 * 60 * 1000);

  const [
    totalCustomers,
    todayShoots,
    upcomingEvents,
    pendingDeliverables,
    deliveredProjects,
    recentCustomers,
    recentDeliverables,
  ] = await Promise.all([
    Customer.countDocuments(),
    Event.countDocuments({ date: { $gte: startOfToday, $lt: startOfTomorrow } }),
    Event.find({ date: { $gte: startOfToday } })
      .sort('date')
      .limit(8)
      .populate('customer', 'customerName'),
    Deliverable.countDocuments({ status: { $ne: 'Delivered' } }),
    Deliverable.countDocuments({ status: 'Delivered' }),
    Customer.find().sort('-createdAt').limit(5),
    Deliverable.find().sort('-updatedAt').limit(5).populate('customer', 'customerName'),
  ]);

  const [todayShootList, recentActivities] = await Promise.all([
    Event.find({ date: { $gte: startOfToday, $lt: startOfTomorrow } }).populate(
      'customer',
      'customerName'
    ),
    getRecentActivities(),
  ]);

  res.json({
    stats: {
      totalCustomers,
      todayShoots,
      upcomingEvents: upcomingEvents.length,
      pendingDeliverables,
      deliveredProjects,
    },
    upcomingEvents,
    todayShootList,
    recentCustomers,
    recentDeliverables,
    recentActivities,
  });
});
