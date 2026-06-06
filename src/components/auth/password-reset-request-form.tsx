'use client';

import { useActionState } from 'react';

import { requestPasswordResetAction } from '@/lib/auth/actions';
import { getInitialAuthFormState } from '@/lib/auth/form-state';
import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/providers/locale-provider';

import { AuthFormMessage } from './auth-form-message';
import { AuthSubmitButton } from './auth-submit-button';

type PasswordResetRequestFormProps = {
  locale: Locale;
};

export function PasswordResetRequestForm({
  locale,
}: PasswordResetRequestFormProps) {
  const t = useTranslations();
  const requestResetForLocale = requestPasswordResetAction.bind(null, locale);
  const [state, formAction] = useActionState(
    requestResetForLocale,
    getInitialAuthFormState(),
  );

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--theme-foreground)]">
          {t('auth.emailLabel')}
        </span>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)] transition outline-none focus:border-[var(--theme-accent)]"
        />
      </label>

      <AuthSubmitButton
        idleLabel={t('auth.resetSubmit')}
        pendingLabel={t('auth.resetPending')}
      />
    </form>
  );
}
