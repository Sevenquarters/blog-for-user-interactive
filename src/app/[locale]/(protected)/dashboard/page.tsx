import { requireUser } from '@/lib/auth/session';
import { getSiteSettings } from '@/lib/db/site-settings';
import { listCategories, listTags } from '@/lib/db/taxonomy';
import { getActiveThemeRecord } from '@/lib/db/themes';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const messages = await getMessages(locale);
  const { user, profile } = await requireUser(locale);
  const [siteSettings, activeTheme, categories, tags] = await Promise.all([
    getSiteSettings(locale),
    getActiveThemeRecord(),
    listCategories(locale),
    listTags(locale),
  ]);

  const cards = [
    {
      label: translateMessage(messages, 'dashboard.roleLabel'),
      value: translateMessage(messages, `roles.${profile.role}`),
    },
    {
      label: translateMessage(messages, 'dashboard.emailLabel'),
      value: user.email ?? '-',
    },
    {
      label: translateMessage(messages, 'dashboard.localeLabel'),
      value: profile.preferred_locale,
    },
    {
      label: translateMessage(messages, 'dashboard.postsPerPageLabel'),
      value: String(siteSettings?.posts_per_page ?? '-'),
    },
    {
      label: translateMessage(messages, 'dashboard.activeThemeLabel'),
      value: activeTheme?.name ?? '-',
    },
    {
      label: translateMessage(messages, 'dashboard.categoryCountLabel'),
      value: String(categories.length),
    },
    {
      label: translateMessage(messages, 'dashboard.tagCountLabel'),
      value: String(tags.length),
    },
  ];

  return (
    <section className="w-full space-y-6">
      <div className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
          {translateMessage(messages, 'dashboard.eyebrow')}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
          {translateMessage(messages, 'dashboard.title')}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--theme-muted)]">
          {translateMessage(messages, 'dashboard.description')}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-[1.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]"
          >
            <p className="text-sm text-[var(--theme-muted)]">{card.label}</p>
            <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
              {card.value}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
