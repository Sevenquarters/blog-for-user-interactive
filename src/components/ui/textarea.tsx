import type { TextareaHTMLAttributes } from 'react';

import { cn } from './utils';

export function textareaClassName(className?: string) {
  return cn(
    'w-full rounded-[1.15rem] border border-[var(--theme-border-strong)] bg-white/88 px-4 py-3 text-sm leading-7 text-[var(--theme-foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition duration-200 outline-none placeholder:text-[color:var(--theme-muted)]/80 hover:border-[var(--theme-accent-soft)] focus:border-[var(--theme-accent)] focus:bg-white focus:ring-4 focus:ring-[var(--theme-focus)] disabled:cursor-not-allowed disabled:opacity-60',
    className,
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={textareaClassName(className)} {...props} />;
}
