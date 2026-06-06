import { getMessages } from '@/i18n/dictionaries';
import { isSupportedLocale } from '@/i18n/config';
import { getMessageValue } from '@/i18n/messages';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const messages = await getMessages(locale);
  const foundationItems = getMessageValue(messages, 'home.foundationItems');

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
          {String(getMessageValue(messages, 'home.eyebrow') ?? '')}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--theme-foreground)] sm:text-5xl">
          {String(getMessageValue(messages, 'home.title') ?? '')}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--theme-muted)] sm:text-lg">
          {String(getMessageValue(messages, 'home.description') ?? '')}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm text-[var(--theme-muted)]">
            Next.js
          </span>
          <span className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm text-[var(--theme-muted)]">
            TypeScript
          </span>
          <span className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm text-[var(--theme-muted)]">
            Tailwind CSS
          </span>
          <span className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm text-[var(--theme-muted)]">
            Supabase
          </span>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)]/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
          {String(getMessageValue(messages, 'home.foundationTitle') ?? '')}
        </p>
        <ul className="mt-6 space-y-4">
          {Array.isArray(foundationItems)
            ? foundationItems.map((item) => (
                <li
                  key={String(item)}
                  className="rounded-2xl border border-[var(--theme-border)] bg-white/70 px-4 py-3 text-sm leading-6 text-[var(--theme-foreground)]"
                >
                  {String(item)}
                </li>
              ))
            : null}
        </ul>
      </section>
    </div>
  );
}
