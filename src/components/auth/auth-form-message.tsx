'use client';

import type { AuthFormState } from '@/lib/auth/form-state';
import { useTranslations } from '@/providers/locale-provider';

type AuthFormMessageProps = {
  state: AuthFormState;
};

export function AuthFormMessage({ state }: AuthFormMessageProps) {
  const t = useTranslations();

  if (state.status === 'idle' || !state.code) {
    return null;
  }

  const translationPath =
    state.status === 'error'
      ? `auth.errors.${state.code}`
      : `auth.feedback.${state.code}`;

  return (
    <p
      className={`rounded-2xl border px-4 py-3 text-sm ${
        state.status === 'error'
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {t(translationPath)}
    </p>
  );
}
