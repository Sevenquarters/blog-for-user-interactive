import Link from 'next/link';

import { AuthCard } from '@/components/auth/auth-card';
import { PasswordResetRequestForm } from '@/components/auth/password-reset-request-form';
import { buildLocalePath } from '@/lib/auth/paths';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ResetPasswordPage({
  params,
}: ResetPasswordPageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const messages = await getMessages(locale);

  return (
    <AuthCard
      title={translateMessage(messages, 'auth.resetTitle')}
      description={translateMessage(messages, 'auth.resetDescription')}
    >
      <div className="space-y-5">
        <PasswordResetRequestForm locale={locale} />
        <Link
          href={buildLocalePath(locale, '/login')}
          className="inline-flex text-sm font-medium text-[var(--theme-accent)]"
        >
          {translateMessage(messages, 'auth.backToLogin')}
        </Link>
      </div>
    </AuthCard>
  );
}
