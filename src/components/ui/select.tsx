import type { SelectHTMLAttributes } from 'react';

import { cn } from './utils';

export function selectClassName(className?: string) {
  return cn(
    'w-full appearance-none rounded-[1.15rem] border border-[var(--theme-border-strong)] bg-white/88 px-4 py-3 pr-10 text-sm text-[var(--theme-foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition duration-200 outline-none hover:border-[var(--theme-accent-soft)] focus:border-[var(--theme-accent)] focus:bg-white focus:ring-4 focus:ring-[var(--theme-focus)] disabled:cursor-not-allowed disabled:opacity-60',
    className,
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={selectClassName(className)} {...props} />;
}
