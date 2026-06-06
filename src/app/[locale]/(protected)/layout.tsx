import { ProtectedShell } from '@/components/layout/protected-shell';
import { isSupportedLocale } from '@/i18n/config';
import { requireUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

type ProtectedLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProtectedLayout({
  children,
  params,
}: ProtectedLayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const { profile } = await requireUser(locale);

  return (
    <ProtectedShell locale={locale} role={profile.role}>
      {children}
    </ProtectedShell>
  );
}
