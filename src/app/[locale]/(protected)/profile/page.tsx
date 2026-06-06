import { requireUser } from '@/lib/auth/session';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const messages = await getMessages(locale);
  const { user, profile } = await requireUser(locale);

  return (
    <section className="w-full rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
        {translateMessage(messages, 'profile.eyebrow')}
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
        {translateMessage(messages, 'profile.title')}
      </h1>
      <p className="mt-3 text-base leading-7 text-[var(--theme-muted)]">
        {translateMessage(messages, 'profile.description')}
      </p>

      <dl className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.5rem] border border-[var(--theme-border)] bg-white/70 p-5">
          <dt className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'profile.displayNameLabel')}
          </dt>
          <dd className="mt-2 text-lg font-semibold text-[var(--theme-foreground)]">
            {profile.display_name ?? '-'}
          </dd>
        </div>
        <div className="rounded-[1.5rem] border border-[var(--theme-border)] bg-white/70 p-5">
          <dt className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'profile.emailLabel')}
          </dt>
          <dd className="mt-2 text-lg font-semibold text-[var(--theme-foreground)]">
            {user.email ?? '-'}
          </dd>
        </div>
        <div className="rounded-[1.5rem] border border-[var(--theme-border)] bg-white/70 p-5">
          <dt className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'profile.roleLabel')}
          </dt>
          <dd className="mt-2 text-lg font-semibold text-[var(--theme-foreground)]">
            {translateMessage(messages, `roles.${profile.role}`)}
          </dd>
        </div>
        <div className="rounded-[1.5rem] border border-[var(--theme-border)] bg-white/70 p-5">
          <dt className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'profile.localeLabel')}
          </dt>
          <dd className="mt-2 text-lg font-semibold text-[var(--theme-foreground)]">
            {profile.preferred_locale}
          </dd>
        </div>
      </dl>
    </section>
  );
}
