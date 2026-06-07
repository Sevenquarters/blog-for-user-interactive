'use client';

import { useFormStatus } from 'react-dom';

type AuthSubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  disabled?: boolean;
};

export function AuthSubmitButton({
  idleLabel,
  pendingLabel,
  disabled = false,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--theme-accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(194,65,12,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
