import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export function Label({ className, ...props }) {
  return (
    <label className={cn('text-sm font-medium text-primary mb-1.5 block', className)} {...props} />
  );
}

export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'flex h-9 w-full rounded-md border border-border bg-white px-3 text-sm text-primary',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:border-accent',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';
