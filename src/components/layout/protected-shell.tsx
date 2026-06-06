import Link from 'next/link';

import { LogoutButton } from '@/components/auth/logout-button';
import { buildLocalePath } from '@/lib/auth/paths';
import type { Locale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import type { AppRole } from '@/types/database';

type ProtectedShellProps = {
  children: React.ReactNode;
  locale: Locale;
  role: AppRole;
};

export async function ProtectedShell({
  children,
  locale,
  role,
}: ProtectedShellProps) {
  const messages = await getMessages(locale);
  const navigation = [
    {
      href: buildLocalePath(locale, '/dashboard'),
      label: translateMessage(messages, 'nav.dashboard'),
    },
    {
      href: buildLocalePath(locale, '/profile'),
      label: translateMessage(messages, 'nav.profile'),
    },
  ];

  if (role === 'admin') {
    navigation.push({
      href: buildLocalePath(locale, '/admin'),
      label: translateMessage(messages, 'nav.admin'),
    });
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] px-6 py-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <nav className="flex flex-wrap items-center gap-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm font-medium text-[var(--theme-foreground)] transition hover:-translate-y-0.5"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <LogoutButton
          locale={locale}
          label={translateMessage(messages, 'nav.logout')}
        />
      </div>
      {children}
    </div>
  );
}
