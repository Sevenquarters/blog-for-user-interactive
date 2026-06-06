'use client';

import { useTheme } from '@/providers/theme-provider';
import { useTranslations } from '@/providers/locale-provider';
import type { ThemeMode } from '@/types/theme';

const THEME_ORDER: ThemeMode[] = ['system', 'light', 'dark'];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const t = useTranslations();

  const nextMode =
    THEME_ORDER[(THEME_ORDER.indexOf(mode) + 1) % THEME_ORDER.length];

  return (
    <button
      type="button"
      onClick={() => setMode(nextMode)}
      className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-2 text-sm font-medium text-[var(--theme-foreground)] shadow-sm transition hover:-translate-y-0.5"
    >
      {t('theme.label')}: {t(`theme.${mode}`)}
    </button>
  );
}
