import bcrypt from 'bcrypt';
import { User, Payment, Expense, Customer } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signFinanceToken, setFinanceCookie } from '../utils/tokens.js';

export const verifyPin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('+financePin');
  const valid = await bcrypt.compare(req.body.pin, user.financePin);

  if (!valid) return res.status(401).json({ message: 'Incorrect PIN' });

  setFinanceCookie(res, signFinanceToken(user));
  res.json({ ok: true });
});

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Builds a Payment/Expense aggregation grouped by calendar month, for the last `months` months. */
function monthlyGroup(Model, dateField = 'date', valueField = 'amount') {
  const since = new Date();
  since.setMonth(since.getMonth() - 5);
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  return Model.aggregate([
    { $match: { [dateField]: { $gte: since } } },
    {
      $group: {
        _id: { y: { $year: `$${dateField}` }, m: { $month: `$${dateField}` } },
        total: { $sum: `$${valueField}` },
      },
    },
  ]);
}

/** Fills in the last 6 months (even ones with zero activity) and merges revenue/expense series. */
function buildMonthlyTrend(revenueRows, expenseRows) {
  const key = (y, m) => `${y}-${m}`;
  const revenueMap = new Map(revenueRows.map((r) => [key(r._id.y, r._id.m), r.total]));
  const expenseMap = new Map(expenseRows.map((r) => [key(r._id.y, r._id.m), r.total]));

  const months = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    months.push({
      month: `${MONTH_LABELS[m - 1]} ${String(y).slice(2)}`,
      revenue: revenueMap.get(key(y, m)) || 0,
      expenses: expenseMap.get(key(y, m)) || 0,
    });
  }
  return months;
}

export const summary = asyncHandler(async (req, res) => {
  const [
    revenueAgg,
    expenseAgg,
    packageAgg,
    recentPayments,
    monthlyRevenue,
    monthlyExpenses,
    expenseByCategory,
    paymentsByMethod,
    customersWithBilling,
  ] = await Promise.all([
    Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
    Customer.aggregate([{ $group: { _id: null, total: { $sum: '$packageAmount' } } }]),
    Payment.find().populate('customer', 'customerName').sort('-date').limit(10),
    monthlyGroup(Payment),
    monthlyGroup(Expense),
    Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
    Payment.aggregate([
      { $group: { _id: '$method', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]),
    // Per-customer billed vs paid, to surface who still owes money.
    Customer.aggregate([
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: 'customer',
          as: 'services',
        },
      },
      {
        $lookup: {
          from: 'payments',
          localField: '_id',
          foreignField: 'customer',
          as: 'payments',
        },
      },
      {
        $project: {
          customerName: 1,
          billed: { $ifNull: ['$packageAmount', { $sum: '$services.price' }] },
          paid: { $sum: '$payments.amount' },
        },
      },
      { $project: { customerName: 1, due: { $subtract: ['$billed', '$paid'] } } },
      { $match: { due: { $gt: 0 } } },
      { $sort: { due: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const revenue = revenueAgg[0]?.total || 0;
  const expenses = expenseAgg[0]?.total || 0;
  const billed = packageAgg[0]?.total || 0;

  res.json({
    revenue,
    expenses,
    profit: revenue - expenses,
    pending: Math.max(0, billed - revenue),
    recentPayments,
    monthlyTrend: buildMonthlyTrend(monthlyRevenue, monthlyExpenses),
    expenseByCategory: expenseByCategory.map((r) => ({ name: r._id, value: r.total })),
    paymentsByMethod: paymentsByMethod.map((r) => ({ name: r._id, value: r.total })),
    outstandingDues: customersWithBilling.map((c) => ({
      customerId: c._id,
      customerName: c.customerName,
      due: c.due,
    })),
  });
});
