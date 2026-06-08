import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from './utils';

type CardTone = 'default' | 'elevated' | 'hero' | 'subtle' | 'dashed';

const CARD_TONES: Record<CardTone, string> = {
  default:
    'border border-[var(--theme-border)] bg-[var(--theme-surface-strong)] shadow-[0_24px_60px_rgba(15,23,42,0.08)]',
  elevated:
    'border border-[var(--theme-border)] bg-[var(--theme-surface-strong)] shadow-[0_28px_72px_rgba(15,23,42,0.1)]',
  hero: 'border border-[var(--theme-border)] bg-[var(--theme-hero)] shadow-[0_32px_90px_rgba(15,23,42,0.12)]',
  subtle:
    'border border-[var(--theme-border)] bg-white/72 shadow-[0_18px_48px_rgba(15,23,42,0.06)]',
  dashed:
    'border border-dashed border-[var(--theme-border-strong)] bg-[var(--theme-surface)] shadow-none',
};

type CardProps = HTMLAttributes<HTMLElement> & {
  as?: 'article' | 'section' | 'div' | 'aside';
  tone?: CardTone;
  interactive?: boolean;
};

export function cardClassName({
  tone = 'default',
  interactive = false,
  className,
}: {
  tone?: CardTone;
  interactive?: boolean;
  className?: string;
}) {
  return cn(
    'rounded-[2rem] transition duration-200',
    CARD_TONES[tone],
    interactive &&
      'hover:-translate-y-1 hover:shadow-[0_34px_78px_rgba(15,23,42,0.12)]',
    className,
  );
}

export function Card({
  as: Tag = 'section',
  tone,
  interactive,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cardClassName({ tone, interactive, className })}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn('space-y-3 p-8', className)}>{children}</div>;
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn('p-6', className)}>{children}</div>;
}
