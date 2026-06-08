import type { HTMLAttributes } from 'react';

import { cn } from './utils';

type BadgeVariant =
  | 'default'
  | 'accent'
  | 'outline'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

const BADGE_STYLES: Record<BadgeVariant, string> = {
  default: 'bg-white/78 text-[var(--theme-foreground)]',
  accent: 'bg-[rgba(194,65,12,0.12)] text-[var(--theme-accent)]',
  outline:
    'border border-[var(--theme-border-strong)] bg-transparent text-[var(--theme-foreground)]',
  success: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border border-red-200 bg-red-50 text-red-700',
  neutral: 'border border-slate-200 bg-slate-100 text-slate-700',
};

export function badgeClassName(
  variant: BadgeVariant = 'default',
  className?: string,
) {
  return cn(
    'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
    BADGE_STYLES[variant],
    className,
  );
}

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ variant, className, ...props }: BadgeProps) {
  return <span className={badgeClassName(variant, className)} {...props} />;
}
