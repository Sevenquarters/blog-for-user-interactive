'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { EmailOtpType } from '@supabase/supabase-js';

import { ensureProfileForUser } from '@/lib/db/profiles';
import { getOptionalAppUrl, isMissingSupabaseEnvError } from '@/lib/env';
import type { Locale } from '@/i18n/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { AuthFormState } from '@/lib/auth/form-state';

import { buildLocalePath, resolveSafeRedirect } from './paths';

async function resolveAppUrl() {
  const configuredAppUrl = getOptionalAppUrl();

  if (configuredAppUrl) {
    return configuredAppUrl.replace(/\/$/, '');
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get('origin');

  if (origin) {
    return origin.replace(/\/$/, '');
  }

  const host =
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');

  if (!host) {
    return 'http://localhost:3000';
  }

  const protocol =
    requestHeaders.get('x-forwarded-proto') ??
    (host.includes('localhost') || host.startsWith('127.0.0.1')
      ? 'http'
      : 'https');

  return `${protocol}://${host}`;
}

export async function loginAction(
  locale: Locale,
  _previousState: AuthFormState,
  formData: FormData,
) {
  try {
    const supabase = await createSupabaseServerClient();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        status: 'error',
        code: 'invalidCredentials',
      } satisfies AuthFormState;
    }

    if (data.user) {
      await ensureProfileForUser(data.user);
    }
  } catch (error) {
    if (isMissingSupabaseEnvError(error)) {
      return {
        status: 'error',
        code: 'missingSupabaseEnv',
      } satisfies AuthFormState;
    }

    throw error;
  }

  const next = resolveSafeRedirect(locale, formData.get('next'), '/dashboard');

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
  try {
    const supabase = await createSupabaseServerClient();
    const email = String(formData.get('email') ?? '').trim();
    const appUrl = await resolveAppUrl();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}${buildLocalePath(
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
  } catch (error) {
    if (isMissingSupabaseEnvError(error)) {
      return {
        status: 'error',
        code: 'missingSupabaseEnv',
      } satisfies AuthFormState;
    }

    throw error;
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
  try {
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
  } catch (error) {
    if (isMissingSupabaseEnvError(error)) {
      return {
        status: 'error',
        code: 'missingSupabaseEnv',
      } satisfies AuthFormState;
    }

    throw error;
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
