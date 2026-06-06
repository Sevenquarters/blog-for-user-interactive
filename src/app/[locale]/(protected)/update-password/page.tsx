import { AuthCard } from '@/components/auth/auth-card';
import { UpdatePasswordForm } from '@/components/auth/update-password-form';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';

type UpdatePasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function UpdatePasswordPage({
  params,
}: UpdatePasswordPageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const messages = await getMessages(locale);

  return (
    <AuthCard
      title={translateMessage(messages, 'auth.updatePasswordTitle')}
      description={translateMessage(messages, 'auth.updatePasswordDescription')}
    >
      <UpdatePasswordForm locale={locale} />
    </AuthCard>
  );
}
