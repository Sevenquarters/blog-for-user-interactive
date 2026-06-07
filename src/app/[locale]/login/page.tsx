import { AuthCard } from '@/components/auth/auth-card';
import { AuthSetupNotice } from '@/components/auth/auth-setup-notice';
import { LoginForm } from '@/components/auth/login-form';
import { resolveSafeRedirect } from '@/lib/auth/paths';
import { getCurrentProfile } from '@/lib/auth/session';
import { getMissingSupabaseEnvNames } from '@/lib/env';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import { redirect } from 'next/navigation';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const profile = await getCurrentProfile();

  if (profile) {
    redirect(
      resolveSafeRedirect(
        locale,
        resolvedSearchParams.next ?? null,
        '/dashboard',
      ),
    );
  }

  const messages = await getMessages(locale);
  const missingEnvNames = getMissingSupabaseEnvNames();
  const isSupabaseConfigured = missingEnvNames.length === 0;

  return (
    <AuthCard
      title={translateMessage(messages, 'auth.loginTitle')}
      description={translateMessage(messages, 'auth.loginDescription')}
    >
      <div className="space-y-5">
        {!isSupabaseConfigured ? (
          <AuthSetupNotice
            title={translateMessage(messages, 'auth.setupMissingTitle')}
            description={translateMessage(
              messages,
              'auth.setupMissingDescription',
            )}
            items={missingEnvNames}
          />
        ) : null}
        <LoginForm
          locale={locale}
          next={resolvedSearchParams.next ?? null}
          disabled={!isSupabaseConfigured}
        />
      </div>
    </AuthCard>
  );
}
