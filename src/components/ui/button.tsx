import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from './utils';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'warning'
  | 'neutral';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--theme-accent)] text-white shadow-[0_20px_45px_rgba(194,65,12,0.28)] hover:-translate-y-0.5 hover:shadow-[0_24px_54px_rgba(194,65,12,0.34)] active:translate-y-px',
  secondary:
    'border border-[var(--theme-border-strong)] bg-white/78 text-[var(--theme-foreground)] shadow-[0_12px_28px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-[var(--theme-accent-soft)] hover:bg-white active:translate-y-px',
  ghost:
    'border border-transparent bg-transparent text-[var(--theme-foreground)] hover:-translate-y-0.5 hover:border-[var(--theme-border)] hover:bg-white/60 active:translate-y-px',
  danger:
    'border border-red-200 bg-red-50 text-red-700 shadow-[0_12px_28px_rgba(127,29,29,0.08)] hover:-translate-y-0.5 hover:bg-red-100 active:translate-y-px',
  success:
    'border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_12px_28px_rgba(6,95,70,0.08)] hover:-translate-y-0.5 hover:bg-emerald-100 active:translate-y-px',
  warning:
    'border border-amber-200 bg-amber-50 text-amber-700 shadow-[0_12px_28px_rgba(146,64,14,0.08)] hover:-translate-y-0.5 hover:bg-amber-100 active:translate-y-px',
  neutral:
    'border border-slate-200 bg-slate-100 text-slate-700 shadow-[0_12px_28px_rgba(51,65,85,0.08)] hover:-translate-y-0.5 hover:bg-slate-200 active:translate-y-px',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-4 py-2 text-sm',
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-12 px-6 py-3 text-sm',
  icon: 'h-11 w-11 p-0 text-sm',
};

type ButtonClassOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  fullWidth?: boolean;
  className?: string;
};

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  active = false,
  fullWidth = false,
  className,
}: ButtonClassOptions = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 outline-none focus-visible:ring-4 focus-visible:ring-[var(--theme-focus)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-55',
    SIZE_STYLES[size],
    VARIANT_STYLES[variant],
    active &&
      variant !== 'primary' &&
      'border-[var(--theme-accent)] bg-[rgba(194,65,12,0.12)] text-[var(--theme-accent)] shadow-[0_16px_34px_rgba(194,65,12,0.14)]',
    fullWidth && 'w-full',
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function Button({
  variant,
  size,
  active,
  fullWidth,
  className,
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassName({
        variant,
        size,
        active,
        fullWidth,
        className,
      })}
      {...props}
    >
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
