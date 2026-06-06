import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';

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

  const messages = await getMessages(locale);

  return (
    <AuthCard
      title={translateMessage(messages, 'auth.loginTitle')}
      description={translateMessage(messages, 'auth.loginDescription')}
    >
      <LoginForm locale={locale} next={resolvedSearchParams.next ?? null} />
    </AuthCard>
  );
}
