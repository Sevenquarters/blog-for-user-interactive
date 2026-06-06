'use client';

import { SUPPORTED_LOCALES } from '@/i18n/config';
import { useLocale, useTranslations } from '@/providers/locale-provider';

export function LanguageSwitcher() {
  const { locale, switchLocale } = useLocale();
  const t = useTranslations();

  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-2 py-2 shadow-sm">
      {SUPPORTED_LOCALES.map((supportedLocale) => {
        const isActive = locale === supportedLocale;

        return (
          <button
            key={supportedLocale}
            type="button"
            onClick={() => switchLocale(supportedLocale)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              isActive
                ? 'bg-[var(--theme-accent)] text-white'
                : 'text-[var(--theme-muted)] hover:bg-white/70 hover:text-[var(--theme-foreground)]'
            }`}
            aria-pressed={isActive}
            aria-label={t(`locales.${supportedLocale}`)}
          >
            {t(`locales.${supportedLocale}`)}
          </button>
        );
      })}
    </div>
  );
}
