import type { Locale } from '@/i18n/config';
import { logoutAction } from '@/lib/auth/actions';

type LogoutButtonProps = {
  locale: Locale;
  label: string;
};

export function LogoutButton({ locale, label }: LogoutButtonProps) {
  const logoutForLocale = logoutAction.bind(null, locale);

  return (
    <form action={logoutForLocale}>
      <button
        type="submit"
        className="rounded-full border border-[var(--theme-border)] bg-[var(--theme-surface)] px-4 py-2 text-sm font-medium text-[var(--theme-foreground)]"
      >
        {label}
      </button>
    </form>
  );
}
