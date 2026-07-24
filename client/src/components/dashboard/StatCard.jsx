import { Card } from '../ui/Card';

export function StatCard({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-secondary">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-primary">{value}</p>
    </Card>
  );
}

export function StatGrid({ children, className }) {
  return <div className={'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 ' + (className || '')}>{children}</div>;
}

export function Skeleton({ className }) {
  return <div className={'animate-pulse rounded-md bg-border/60 ' + (className || 'h-24 w-full')} />;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
