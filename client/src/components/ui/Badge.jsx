import { cn } from '../../lib/utils';

const tones = {
  default: 'bg-surface text-secondary border-border',
  accent: 'bg-accent/10 text-accent border-accent/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
};

// Maps known status strings to a sensible tone automatically.
const STATUS_TONE = {
  Pending: 'default',
  Working: 'warning',
  Ready: 'accent',
  Delivered: 'success',
};

export function Badge({ className, tone, children, ...props }) {
  const resolvedTone = tone || STATUS_TONE[children] || 'default';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tones[resolvedTone],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
