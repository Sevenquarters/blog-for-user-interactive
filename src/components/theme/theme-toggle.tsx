'use client';

import { useTheme } from '@/providers/theme-provider';
import { useTranslations } from '@/providers/locale-provider';
import type { ThemeMode } from '@/types/theme';
import { Button } from '@/components/ui';

const THEME_ORDER: ThemeMode[] = ['system', 'light', 'dark'];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const t = useTranslations();

  const nextMode =
    THEME_ORDER[(THEME_ORDER.indexOf(mode) + 1) % THEME_ORDER.length];

  return (
    <Button type="button" variant="secondary" size="md" onClick={() => setMode(nextMode)}>
      {t('theme.label')}: {t(`theme.${mode}`)}
    </Button>
  );
}
