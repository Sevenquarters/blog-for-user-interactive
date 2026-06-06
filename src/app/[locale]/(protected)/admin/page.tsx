import { requireRole } from '@/lib/auth/session';
import { getSiteSettings } from '@/lib/db/site-settings';
import { getActiveThemeRecord } from '@/lib/db/themes';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const messages = await getMessages(locale);
  const [{ profile }, siteSettings, activeTheme] = await Promise.all([
    requireRole(locale, ['admin']),
    getSiteSettings(locale),
    getActiveThemeRecord(),
  ]);

  return (
    <section className="w-full space-y-6">
      <div className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
          {translateMessage(messages, 'admin.eyebrow')}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
          {translateMessage(messages, 'admin.title')}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--theme-muted)]">
          {translateMessage(messages, 'admin.description')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'admin.currentRoleLabel')}
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
            {translateMessage(messages, `roles.${profile.role}`)}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'admin.siteNameLabel')}
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
            {siteSettings?.site_name ?? '-'}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'admin.defaultLocaleLabel')}
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
            {siteSettings?.default_locale ?? '-'}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'admin.activeThemeLabel')}
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
            {activeTheme?.name ?? '-'}
          </p>
        </article>
      </div>
    </section>
  );
}
