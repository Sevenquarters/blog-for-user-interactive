import type { ReactNode } from 'react';

import { Button } from './button';
import { cardClassName } from './card';
import { cn } from './utils';

type DialogProps = {
  open: boolean;
  title: string;
  onClose?: () => void;
  closeLabel?: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  title,
  onClose,
  closeLabel,
  children,
  className,
}: DialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/58 px-4 py-8 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          cardClassName({
            tone: 'elevated',
            className:
              'max-h-[90vh] w-full overflow-y-auto bg-[var(--theme-background)]',
          }),
          className,
        )}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--theme-border)] px-6 py-5">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--theme-foreground)]">
            {title}
          </h2>
          {onClose && closeLabel ? (
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              {closeLabel}
            </Button>
          ) : null}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
