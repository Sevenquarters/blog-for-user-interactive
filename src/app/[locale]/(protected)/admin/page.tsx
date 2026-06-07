import { ContentFlashMessage } from '@/components/content/content-flash-message';
import { requireRole } from '@/lib/auth/session';
import {
  activateThemeAction,
  updateSiteSettingsAction,
  updateThemeTokensAction,
} from '@/lib/admin/actions';
import { getEditableSiteSettings } from '@/lib/db/site-settings';
import { listThemeRecords } from '@/lib/db/themes';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';

type AdminPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

const SUCCESS_MESSAGES: Record<string, string> = {
  saved: 'admin.feedback.saved',
  themeSaved: 'admin.feedback.themeSaved',
  themeActivated: 'admin.feedback.themeActivated',
};

const ERROR_MESSAGES: Record<string, string> = {
  saveFailed: 'admin.errors.saveFailed',
  themeIncomplete: 'admin.errors.themeIncomplete',
  themeSaveFailed: 'admin.errors.themeSaveFailed',
  themeActivateFailed: 'admin.errors.themeActivateFailed',
};

export default async function AdminPage({
  params,
  searchParams,
}: AdminPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const messages = await getMessages(locale);
  const [{ profile }, siteSettings, themes] = await Promise.all([
    requireRole(locale, ['admin']),
    getEditableSiteSettings(),
    listThemeRecords(),
  ]);
  const saveSettings = updateSiteSettingsAction.bind(null, locale);
  const successPath = resolvedSearchParams.success
    ? SUCCESS_MESSAGES[resolvedSearchParams.success]
    : null;
  const errorPath = resolvedSearchParams.error
    ? ERROR_MESSAGES[resolvedSearchParams.error]
    : null;

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

      {successPath ? (
        <ContentFlashMessage
          tone="success"
          message={translateMessage(messages, successPath)}
        />
      ) : null}
      {errorPath ? (
        <ContentFlashMessage
          tone="error"
          message={translateMessage(messages, errorPath)}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            {siteSettings.translations[locale].siteName || '-'}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'admin.defaultLocaleLabel')}
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
            {siteSettings.defaultLocale}
          </p>
        </article>
        <article className="rounded-[1.5rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
          <p className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'admin.activeThemeLabel')}
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
            {themes.find((theme) => theme.record.is_active)?.record.name ?? '-'}
          </p>
        </article>
      </div>

      <section className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
        <h2 className="text-2xl font-semibold text-[var(--theme-foreground)]">
          {translateMessage(messages, 'admin.settingsTitle')}
        </h2>
        <form action={saveSettings} className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.siteNameEnLabel')}
              </span>
              <input
                type="text"
                name="siteNameEn"
                defaultValue={siteSettings.translations.en.siteName}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.siteNameZhCnLabel')}
              </span>
              <input
                type="text"
                name="siteNameZhCn"
                defaultValue={siteSettings.translations['zh-CN'].siteName}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.siteDescriptionEnLabel')}
              </span>
              <textarea
                name="siteDescriptionEn"
                rows={3}
                defaultValue={siteSettings.translations.en.siteDescription}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.siteDescriptionZhCnLabel')}
              </span>
              <textarea
                name="siteDescriptionZhCn"
                rows={3}
                defaultValue={siteSettings.translations['zh-CN'].siteDescription}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.postsPerPageSettingLabel')}
              </span>
              <input
                type="number"
                min="1"
                name="postsPerPage"
                defaultValue={siteSettings.postsPerPage}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.defaultLocaleSettingLabel')}
              </span>
              <select
                name="defaultLocale"
                defaultValue={siteSettings.defaultLocale}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              >
                <option value="en">en</option>
                <option value="zh-CN">zh-CN</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.activeThemeSettingLabel')}
              </span>
              <select
                name="activeThemeId"
                defaultValue={siteSettings.activeThemeId ?? ''}
                className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
              >
                {themes.map((theme) => (
                  <option key={theme.record.id} value={theme.record.id}>
                    {theme.record.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--theme-accent)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(194,65,12,0.3)] transition hover:-translate-y-0.5"
            >
              {translateMessage(messages, 'admin.saveSettingsButton')}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-5">
        <h2 className="text-2xl font-semibold text-[var(--theme-foreground)]">
          {translateMessage(messages, 'admin.themesTitle')}
        </h2>
        <div className="grid gap-5">
          {themes.map((theme) => {
            const saveTheme = updateThemeTokensAction.bind(
              null,
              locale,
              theme.record.id,
            );
            const activateCurrentTheme = activateThemeAction.bind(
              null,
              locale,
              theme.record.id,
            );

            return (
              <article
                key={theme.record.id}
                className="rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 shadow-[0_18px_48px_rgba(15,23,42,0.06)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--theme-foreground)]">
                      {theme.record.name}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--theme-muted)]">
                      {theme.record.slug}
                    </p>
                  </div>
                  {theme.record.is_active ? (
                    <span className="rounded-full bg-[rgba(194,65,12,0.12)] px-4 py-2 text-sm font-medium text-[var(--theme-accent)]">
                      {translateMessage(messages, 'admin.activeThemeBadge')}
                    </span>
                  ) : (
                    <form action={activateCurrentTheme}>
                      <button
                        type="submit"
                        className="rounded-full border border-[var(--theme-border)] px-4 py-2 text-sm font-medium text-[var(--theme-foreground)]"
                      >
                        {translateMessage(messages, 'admin.activateThemeButton')}
                      </button>
                    </form>
                  )}
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <div
                    className="rounded-[1.5rem] p-5"
                    style={{
                      background: theme.definition.tokens.background,
                      color: theme.definition.tokens.foreground,
                      border: `1px solid ${theme.definition.tokens.border}`,
                    }}
                  >
                    <p className="text-sm font-semibold">
                      {translateMessage(messages, 'admin.lightPreviewLabel')}
                    </p>
                    <div className="mt-4 flex gap-3">
                      <span
                        className="h-10 w-10 rounded-full"
                        style={{ background: theme.definition.tokens.accent }}
                      />
                      <span
                        className="h-10 w-10 rounded-full"
                        style={{ background: theme.definition.tokens.surface }}
                      />
                      <span
                        className="h-10 w-10 rounded-full"
                        style={{ background: theme.definition.tokens.muted }}
                      />
                    </div>
                  </div>
                  <div
                    className="rounded-[1.5rem] p-5"
                    style={{
                      background: theme.definition.darkTokens.background,
                      color: theme.definition.darkTokens.foreground,
                      border: `1px solid ${theme.definition.darkTokens.border}`,
                    }}
                  >
                    <p className="text-sm font-semibold">
                      {translateMessage(messages, 'admin.darkPreviewLabel')}
                    </p>
                    <div className="mt-4 flex gap-3">
                      <span
                        className="h-10 w-10 rounded-full"
                        style={{ background: theme.definition.darkTokens.accent }}
                      />
                      <span
                        className="h-10 w-10 rounded-full"
                        style={{ background: theme.definition.darkTokens.surface }}
                      />
                      <span
                        className="h-10 w-10 rounded-full"
                        style={{ background: theme.definition.darkTokens.muted }}
                      />
                    </div>
                  </div>
                </div>

                <form action={saveTheme} className="mt-6 grid gap-5">
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-[var(--theme-foreground)]">
                        {translateMessage(messages, 'admin.lightTokensTitle')}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.background')}
                          </span>
                          <input
                            type="text"
                            name="backgroundLight"
                            defaultValue={theme.definition.tokens.background}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.surface')}
                          </span>
                          <input
                            type="text"
                            name="surfaceLight"
                            defaultValue={theme.definition.tokens.surface}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.foreground')}
                          </span>
                          <input
                            type="text"
                            name="foregroundLight"
                            defaultValue={theme.definition.tokens.foreground}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.muted')}
                          </span>
                          <input
                            type="text"
                            name="mutedLight"
                            defaultValue={theme.definition.tokens.muted}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.accent')}
                          </span>
                          <input
                            type="text"
                            name="accentLight"
                            defaultValue={theme.definition.tokens.accent}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.border')}
                          </span>
                          <input
                            type="text"
                            name="borderLight"
                            defaultValue={theme.definition.tokens.border}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-[var(--theme-foreground)]">
                        {translateMessage(messages, 'admin.darkTokensTitle')}
                      </h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.background')}
                          </span>
                          <input
                            type="text"
                            name="backgroundDark"
                            defaultValue={theme.definition.darkTokens.background}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.surface')}
                          </span>
                          <input
                            type="text"
                            name="surfaceDark"
                            defaultValue={theme.definition.darkTokens.surface}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.foreground')}
                          </span>
                          <input
                            type="text"
                            name="foregroundDark"
                            defaultValue={theme.definition.darkTokens.foreground}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.muted')}
                          </span>
                          <input
                            type="text"
                            name="mutedDark"
                            defaultValue={theme.definition.darkTokens.muted}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.accent')}
                          </span>
                          <input
                            type="text"
                            name="accentDark"
                            defaultValue={theme.definition.darkTokens.accent}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.border')}
                          </span>
                          <input
                            type="text"
                            name="borderDark"
                            defaultValue={theme.definition.darkTokens.border}
                            className="w-full rounded-2xl border border-[var(--theme-border)] bg-white px-4 py-3 text-sm text-[var(--theme-foreground)]"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="rounded-full border border-[var(--theme-border)] px-5 py-3 text-sm font-semibold text-[var(--theme-foreground)]"
                    >
                      {translateMessage(messages, 'admin.saveThemeButton')}
                    </button>
                  </div>
                </form>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
