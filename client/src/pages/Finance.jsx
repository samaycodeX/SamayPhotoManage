import { useQuery } from 'react-query';
import { Navigate, Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { api } from '../lib/api';
import { money, formatDate } from '../lib/utils';
import { StatGrid, StatCard, Skeleton, PageHeader } from '../components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const PIE_COLORS = [
  'hsl(221 83% 53%)',
  'hsl(142 71% 45%)',
  'hsl(38 92% 50%)',
  'hsl(0 84% 60%)',
  'hsl(220 9% 46%)',
  'hsl(262 83% 58%)',
  'hsl(199 89% 48%)',
  'hsl(330 81% 60%)',
];

export default function Finance() {
  const { data, isLoading, error } = useQuery('finance', () =>
    api.get('/finance/summary').then((r) => r.data)
  );

  if (error) return <Navigate to="/" replace />;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <StatGrid>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </StatGrid>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const {
    revenue,
    expenses,
    profit,
    pending,
    recentPayments,
    monthlyTrend,
    expenseByCategory,
    paymentsByMethod,
    outstandingDues,
  } = data;

  return (
    <>
      <PageHeader title="Finance" subtitle="Secure studio financial overview." />

      <StatGrid>
        <StatCard label="Total Revenue" value={money(revenue)} />
        <StatCard label="Total Expenses" value={money(expenses)} />
        <StatCard label="Net Profit" value={money(profit)} />
        <StatCard label="Pending Payments" value={money(pending)} />
      </StatGrid>

      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses — last 6 months</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="month" stroke="hsl(220 9% 46%)" fontSize={12} />
              <YAxis stroke="hsl(220 9% 46%)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(221 83% 53%)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {expenseByCategory?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {expenseByCategory.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => money(v)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-secondary">No expenses recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments by Method</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {paymentsByMethod?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentsByMethod} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                  <XAxis type="number" stroke="hsl(220 9% 46%)" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <YAxis type="category" dataKey="name" stroke="hsl(220 9% 46%)" fontSize={12} width={90} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Bar dataKey="value" fill="hsl(221 83% 53%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-secondary">No payments recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Outstanding Dues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {outstandingDues?.length ? (
            outstandingDues.map((c) => (
              <Link
                key={c.customerId}
                to={`/customers/${c.customerId}`}
                className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-surface"
              >
                <span className="font-medium text-primary">{c.customerName}</span>
                <span className="font-medium text-danger">{money(c.due)}</span>
              </Link>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-secondary">No outstanding dues — everyone's paid up.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {recentPayments?.length ? (
            recentPayments.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-surface">
                <div>
                  <p className="font-medium text-primary">{p.customer?.customerName}</p>
                  <p className="text-xs text-secondary">{formatDate(p.date)} · {p.method}</p>
                </div>
                <span className="font-medium text-primary">{money(p.amount)}</span>
              </div>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-secondary">No payments recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
