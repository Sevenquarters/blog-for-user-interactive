'use client';

import Link from 'next/link';

import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useLocale, useTranslations } from '@/providers/locale-provider';

export function SiteHeader() {
  const { locale } = useLocale();
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--theme-border)] bg-[rgba(255,253,248,0.82)] backdrop-blur xl:bg-[rgba(255,253,248,0.7)] dark:bg-[rgba(17,24,39,0.74)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--theme-accent)] text-sm font-bold text-white shadow-[0_12px_28px_rgba(194,65,12,0.32)]">
            BI
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

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
