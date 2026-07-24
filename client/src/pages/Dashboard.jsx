import { useQuery } from 'react-query';
import { api } from '../lib/api';
import { StatGrid, StatCard, Skeleton, PageHeader } from '../components/dashboard/StatCard';
import { ListCard } from '../components/dashboard/ListCard';
import { formatDate } from '../lib/utils';

export default function Dashboard() {
  const { data, isLoading } = useQuery('dashboard', () =>
    api.get('/dashboard').then((r) => r.data)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <StatGrid>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </StatGrid>
      </div>
    );
  }

  const { stats, upcomingEvents, todayShootList } = data;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Here's what's happening at your studio today." />

      <StatGrid className="grid-cols-3 lg:grid-cols-3">
        <StatCard label="Total Customers" value={stats.totalCustomers} />
        <StatCard label="Today's Shoots" value={stats.todayShoots} />
        <StatCard label="Upcoming Events" value={stats.upcomingEvents} />
        {/* <StatCard label="Pending Deliverables" value={stats.pendingDeliverables} />
        <StatCard label="Delivered Projects" value={stats.deliveredProjects} /> */}
      </StatGrid>

      <div className="grid gap-4 md:grid-cols-2">
        <ListCard
          title="Upcoming Events"
          rows={upcomingEvents}
          emptyText="No upcoming events."
          renderRow={(e) => (
            <>
              <div>
                <p className="font-medium text-primary">{e.type}</p>
                <p className="text-xs text-secondary">{e.customer?.customerName}</p>
              </div>
              <span className="text-xs text-secondary">{formatDate(e.date)}</span>
            </>
          )}
        />
        <ListCard
          title="Today's Shoot"
          rows={todayShootList}
          emptyText="No shoots scheduled today."
          renderRow={(e) => (
            <>
              <div>
                <p className="font-medium text-primary">{e.type}</p>
                <p className="text-xs text-secondary">{e.customer?.customerName}</p>
              </div>
              <span className="text-xs text-secondary">{e.time || '—'}</span>
            </>
          )}
        />
      </div>
    </>
  );
}
