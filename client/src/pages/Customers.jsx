import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { PageHeader } from '../components/dashboard/StatCard';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { formatDate } from '../lib/utils';

export default function Customers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(['customers', search, page], () =>
    api.get('/customers', { params: { search, page, limit: 15 } }).then((r) => r.data)
  );

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="People and events your studio serves."
        action={
          <Button onClick={() => navigate('/customers/new')}>
            <Plus size={18} /> Add customer
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
        <Input
          className="pl-9"
          placeholder="Search by name or mobile number"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <Card>
        <div className="divide-y divide-border">
          <div className="grid grid-cols-4 gap-4 px-5 py-3 text-xs font-medium uppercase tracking-wide text-secondary">
            <span>Customer</span>
            <span>Mobile</span>
            <span>Main Event</span>
            <span>Event Date</span>
          </div>
          {isLoading ? (
            <p className="px-5 py-8 text-center text-sm text-secondary">Loading…</p>
          ) : data?.data?.length ? (
            data.data.map((c) => (
              <Link
                key={c._id}
                to={`/customers/${c._id}`}
                className="grid grid-cols-4 gap-4 px-5 py-3 text-sm hover:bg-surface"
              >
                <span className="font-medium text-primary">{c.customerName}</span>
                <span className="text-secondary">{c.mobileNumber}</span>
                <span className="text-secondary">{c.mainEvent?.eventName || '—'}</span>
                <span className="text-secondary">{c.mainEvent ? formatDate(c.mainEvent.eventDate) : '—'}</span>
              </Link>
            ))
          ) : (
            <p className="px-5 py-8 text-center text-sm text-secondary">No customers found.</p>
          )}
        </div>
      </Card>

      {data?.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-secondary">
          <span>
            Page {data.page} of {data.pages} · {data.total} customers
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft size={17} />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight size={17} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
