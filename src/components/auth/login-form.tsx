'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { loginAction } from '@/lib/auth/actions';
import { getInitialAuthFormState } from '@/lib/auth/form-state';
import { buildLocalePath } from '@/lib/auth/paths';
import type { Locale } from '@/i18n/config';
import { useTranslations } from '@/providers/locale-provider';

import { AuthFormMessage } from './auth-form-message';
import { AuthSubmitButton } from './auth-submit-button';

type LoginFormProps = {
  locale: Locale;
  next: string | null;
  disabled?: boolean;
};

export function LoginForm({ locale, next, disabled = false }: LoginFormProps) {
  const t = useTranslations();
  const loginForLocale = loginAction.bind(null, locale);
  const [state, formAction] = useActionState(
    loginForLocale,
    getInitialAuthFormState(),
  );

  return (
    <form action={formAction} className="space-y-5">
      <AuthFormMessage state={state} />
      <input type="hidden" name="next" value={next ?? ''} />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--theme-foreground)]">
          {t('auth.emailLabel')}
        </span>
        <input
          type="email"
          name="email"
          required
          disabled={disabled}
          className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)] transition outline-none focus:border-[var(--theme-accent)]"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--theme-foreground)]">
          {t('auth.passwordLabel')}
        </span>
        <input
          type="password"
          name="password"
          required
          disabled={disabled}
          className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)] transition outline-none focus:border-[var(--theme-accent)]"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <AuthSubmitButton
          idleLabel={t('auth.loginSubmit')}
          pendingLabel={t('auth.loginPending')}
          disabled={disabled}
        />
        <Link
          href={buildLocalePath(locale, '/reset-password')}
          className="text-sm font-medium text-[var(--theme-accent)]"
        >
          {t('auth.resetLink')}
        </Link>
      </div>
    </form>
  );
}
