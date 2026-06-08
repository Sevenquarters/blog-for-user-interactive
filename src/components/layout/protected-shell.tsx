import Link from 'next/link';

import { LogoutButton } from '@/components/auth/logout-button';
import { buildLocalePath } from '@/lib/auth/paths';
import type { Locale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import type { AppRole } from '@/types/database';
import { Card, buttonClassName, cn } from '@/components/ui';

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
      href: buildLocalePath(locale, '/posts'),
      label: translateMessage(messages, 'nav.posts'),
    },
    {
      href: buildLocalePath(locale, '/profile'),
      label: translateMessage(messages, 'nav.profile'),
    },
  ];

  if (role === 'admin' || role === 'editor') {
    navigation.push(
      {
        href: buildLocalePath(locale, '/media'),
        label: translateMessage(messages, 'nav.media'),
      },
      {
        href: buildLocalePath(locale, '/comments'),
        label: translateMessage(messages, 'nav.comments'),
      },
    );
  }

  if (role === 'admin') {
    navigation.push({
      href: buildLocalePath(locale, '/admin'),
      label: translateMessage(messages, 'nav.admin'),
    });
  }

  return (
    <div className="w-full space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <nav className="flex flex-wrap items-center gap-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonClassName({
                  variant: 'secondary',
                  size: 'sm',
                }),
                'min-h-10',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <LogoutButton
          locale={locale}
          label={translateMessage(messages, 'nav.logout')}
        />
      </Card>
      {children}
    </div>
  );
}
