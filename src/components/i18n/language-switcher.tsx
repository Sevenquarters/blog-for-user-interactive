'use client';

import { SUPPORTED_LOCALES } from '@/i18n/config';
import { useLocale, useTranslations } from '@/providers/locale-provider';
import { SegmentedControl } from '@/components/ui';

export function LanguageSwitcher() {
  const { locale, switchLocale } = useLocale();
  const t = useTranslations();

  return (
    <SegmentedControl
      label={t('nav.language')}
      value={locale}
      onChange={switchLocale}
      options={SUPPORTED_LOCALES.map((supportedLocale) => ({
        value: supportedLocale,
        label: supportedLocale === 'zh-CN' ? '中文' : 'EN',
        ariaLabel: t(`locales.${supportedLocale}`),
      }))}
      className="min-w-[10rem]"
    />
  );
}
