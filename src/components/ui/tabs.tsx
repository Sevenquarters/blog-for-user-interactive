import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './utils';

export function TabsList({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 rounded-[1.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2 shadow-[0_18px_44px_rgba(15,23,42,0.05)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function tabTriggerClassName(active: boolean, className?: string) {
  return cn(
    'inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition duration-200 outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]',
    active
      ? 'bg-[var(--theme-accent)] text-white shadow-[0_14px_30px_rgba(194,65,12,0.22)]'
      : 'text-[var(--theme-foreground)] hover:bg-white/76',
    className,
  );
}

export function TabsPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn('mt-5', className)}>{children}</div>;
}
