'use server';

import { redirect } from 'next/navigation';
import type { EmailOtpType } from '@supabase/supabase-js';

import { getPublicEnv } from '@/lib/env';
import type { Locale } from '@/i18n/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AuthFormState } from '@/lib/auth/form-state';

import { buildLocalePath, resolveSafeRedirect } from './paths';

export async function loginAction(
  locale: Locale,
  _previousState: AuthFormState,
  formData: FormData,
) {
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = resolveSafeRedirect(locale, formData.get('next'), '/dashboard');

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      status: 'error',
      code: 'invalidCredentials',
    } satisfies AuthFormState;
  }

  redirect(next);
}

export async function logoutAction(locale: Locale) {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut();

  redirect(buildLocalePath(locale, '/login'));
}

export async function requestPasswordResetAction(
  locale: Locale,
  _previousState: AuthFormState,
  formData: FormData,
) {
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get('email') ?? '').trim();
  const env = getPublicEnv();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}${buildLocalePath(
      locale,
      '/auth/callback?next=/update-password&type=recovery',
    )}`,
  });

  if (error) {
    return {
      status: 'error',
      code: 'resetRequestFailed',
    } satisfies AuthFormState;
  }

  return {
    status: 'success',
    code: 'resetRequestSent',
  } satisfies AuthFormState;
}

export async function updatePasswordAction(
  locale: Locale,
  _previousState: AuthFormState,
  formData: FormData,
) {
  const supabase = await createSupabaseServerClient();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password.length < 8) {
    return {
      status: 'error',
      code: 'passwordTooShort',
    } satisfies AuthFormState;
  }

  if (password !== confirmPassword) {
    return {
      status: 'error',
      code: 'passwordMismatch',
    } satisfies AuthFormState;
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      status: 'error',
      code: 'passwordUpdateFailed',
    } satisfies AuthFormState;
  }

  redirect(buildLocalePath(locale, '/dashboard'));
}

type AuthCallbackParams = {
  tokenHash: string | null;
  type: EmailOtpType | null;
};

export async function verifyAuthCallback({
  tokenHash,
  type,
}: AuthCallbackParams) {
  if (!tokenHash || !type) {
    return false;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return false;
  }

  return true;
}
