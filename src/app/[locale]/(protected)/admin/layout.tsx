import { isSupportedLocale } from '@/i18n/config';
import { requireRole } from '@/lib/auth/session';

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  await requireRole(locale, ['admin']);

  return <>{children}</>;
}
