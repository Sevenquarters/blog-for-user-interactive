'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { buttonClassName, cn } from '@/components/ui';
import { useLocale, useTranslations } from '@/providers/locale-provider';

export function SiteHeader() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const t = useTranslations();
  const navigationItems = [
    {
      href: `/${locale}`,
      label: t('nav.home'),
    },
    {
      href: `/${locale}/blog`,
      label: t('nav.blog'),
    },
    {
      href: `/${locale}/dashboard`,
      label: t('nav.dashboard'),
    },
    {
      href: `/${locale}/search`,
      label: locale === 'zh-CN' ? '搜索' : 'Search',
    },
    {
      href: `/${locale}/login`,
      label: t('nav.login'),
    },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--theme-border)] bg-[color:var(--theme-surface)]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 rounded-[1.5rem] pr-2 transition hover:translate-x-0.5"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[1.15rem] bg-[var(--theme-accent)] text-sm font-bold text-white shadow-[0_16px_32px_rgba(194,65,12,0.32)]">
              PB
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-[var(--theme-accent)] uppercase">
                {t('common.phase')}
              </p>
              <p className="text-lg font-semibold text-[var(--theme-foreground)]">
                {t('common.projectName')}
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-[1.6rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-2 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonClassName({
                    variant: isActive ? 'primary' : 'ghost',
                    size: 'sm',
                    active: isActive,
                  }),
                  'min-h-10',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
