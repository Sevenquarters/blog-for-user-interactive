'use client';

import { useActionState } from 'react';

import { updatePasswordAction } from '@/lib/auth/actions';
import { getInitialAuthFormState } from '@/lib/auth/form-state';
import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/providers/locale-provider';

import { AuthFormMessage } from './auth-form-message';
import { AuthSubmitButton } from './auth-submit-button';

type UpdatePasswordFormProps = {
  locale: Locale;
};

export function UpdatePasswordForm({ locale }: UpdatePasswordFormProps) {
  const t = useTranslations();
  const updatePasswordForLocale = updatePasswordAction.bind(null, locale);
  const [state, formAction] = useActionState(
    updatePasswordForLocale,
    getInitialAuthFormState(),
  );

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--theme-foreground)]">
          {t('auth.passwordLabel')}
        </span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)] transition outline-none focus:border-[var(--theme-accent)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--theme-foreground)]">
          {t('auth.confirmPasswordLabel')}
        </span>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)] transition outline-none focus:border-[var(--theme-accent)]"
        />
      </label>

      <AuthSubmitButton
        idleLabel={t('auth.updatePasswordSubmit')}
        pendingLabel={t('auth.updatePasswordPending')}
      />
    </form>
  );
}
