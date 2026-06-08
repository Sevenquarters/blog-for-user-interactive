import type { Locale } from '@/i18n/config';
import { logoutAction } from '@/lib/auth/actions';
import { Button } from '@/components/ui';

type LogoutButtonProps = {
  locale: Locale;
  label: string;
};

export function LogoutButton({ locale, label }: LogoutButtonProps) {
  const logoutForLocale = logoutAction.bind(null, locale);

  return (
    <form action={logoutForLocale}>
      <Button type="submit" variant="secondary" size="sm">
        {label}
      </Button>
    </form>
  );
}
