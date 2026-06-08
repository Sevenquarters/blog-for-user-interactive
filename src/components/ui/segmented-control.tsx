'use client';

import type { KeyboardEvent } from 'react';

import { cn } from './utils';

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  ariaLabel?: string;
};

type SegmentedControlProps<T extends string> = {
  label: string;
  value: T;
  options: Array<SegmentedOption<T>>;
  onChange: (value: T) => void;
  className?: string;
};

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();

    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (activeIndex + direction + options.length) % options.length;

    onChange(options[nextIndex]!.value);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative inline-grid min-h-12 grid-cols-2 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] p-1 shadow-[0_16px_40px_rgba(15,23,42,0.08)] outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)]',
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 rounded-full bg-[var(--theme-accent)] shadow-[0_14px_28px_rgba(194,65,12,0.26)] transition duration-300 ease-out"
        style={{
          left: `calc(${(100 / options.length) * activeIndex}% + 0.25rem)`,
          width: `calc(${100 / options.length}% - 0.5rem)`,
        }}
      />
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.ariaLabel ?? option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-10 min-w-[5rem] rounded-full px-4 py-2 text-sm font-semibold transition duration-300',
              isActive
                ? 'text-white'
                : 'text-[var(--theme-muted)] hover:text-[var(--theme-foreground)]',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
