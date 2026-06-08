import { ContentFlashMessage } from '@/components/content/content-flash-message';
import { Badge, Button, Card, Input, Select, Textarea } from '@/components/ui';
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
      <Card tone="hero" className="p-8">
        <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
          {translateMessage(messages, 'admin.eyebrow')}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
          {translateMessage(messages, 'admin.title')}
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--theme-muted)]">
          {translateMessage(messages, 'admin.description')}
        </p>
      </Card>

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
        <Card as="article" className="rounded-[1.5rem] p-5">
          <p className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'admin.currentRoleLabel')}
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
            {translateMessage(messages, `roles.${profile.role}`)}
          </p>
        </Card>
        <Card as="article" className="rounded-[1.5rem] p-5">
          <p className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'admin.siteNameLabel')}
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
            {siteSettings.translations[locale].siteName || '-'}
          </p>
        </Card>
        <Card as="article" className="rounded-[1.5rem] p-5">
          <p className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'admin.defaultLocaleLabel')}
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
            {siteSettings.defaultLocale}
          </p>
        </Card>
        <Card as="article" className="rounded-[1.5rem] p-5">
          <p className="text-sm text-[var(--theme-muted)]">
            {translateMessage(messages, 'admin.activeThemeLabel')}
          </p>
          <p className="mt-3 text-xl font-semibold text-[var(--theme-foreground)]">
            {themes.find((theme) => theme.record.is_active)?.record.name ?? '-'}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold text-[var(--theme-foreground)]">
          {translateMessage(messages, 'admin.settingsTitle')}
        </h2>
        <form action={saveSettings} className="mt-5 grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.siteNameEnLabel')}
              </span>
              <Input
                type="text"
                name="siteNameEn"
                defaultValue={siteSettings.translations.en.siteName}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.siteNameZhCnLabel')}
              </span>
              <Input
                type="text"
                name="siteNameZhCn"
                defaultValue={siteSettings.translations['zh-CN'].siteName}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.siteDescriptionEnLabel')}
              </span>
              <Textarea
                name="siteDescriptionEn"
                rows={3}
                defaultValue={siteSettings.translations.en.siteDescription}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.siteDescriptionZhCnLabel')}
              </span>
              <Textarea
                name="siteDescriptionZhCn"
                rows={3}
                defaultValue={siteSettings.translations['zh-CN'].siteDescription}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.postsPerPageSettingLabel')}
              </span>
              <Input
                type="number"
                min="1"
                name="postsPerPage"
                defaultValue={siteSettings.postsPerPage}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.defaultLocaleSettingLabel')}
              </span>
              <Select
                name="defaultLocale"
                defaultValue={siteSettings.defaultLocale}
              >
                <option value="en">en</option>
                <option value="zh-CN">zh-CN</option>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--theme-foreground)]">
                {translateMessage(messages, 'admin.activeThemeSettingLabel')}
              </span>
              <Select
                name="activeThemeId"
                defaultValue={siteSettings.activeThemeId ?? ''}
              >
                {themes.map((theme) => (
                  <option key={theme.record.id} value={theme.record.id}>
                    {theme.record.name}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div>
            <Button type="submit" variant="primary" size="lg">
              {translateMessage(messages, 'admin.saveSettingsButton')}
            </Button>
          </div>
        </form>
      </Card>

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
              <Card
                key={theme.record.id}
                as="article"
                className="p-6"
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
                    <Badge variant="accent" className="px-4 py-2">
                      {translateMessage(messages, 'admin.activeThemeBadge')}
                    </Badge>
                  ) : (
                    <form action={activateCurrentTheme}>
                      <Button type="submit" variant="secondary" size="sm">
                        {translateMessage(messages, 'admin.activateThemeButton')}
                      </Button>
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
                          <Input
                            type="text"
                            name="backgroundLight"
                            defaultValue={theme.definition.tokens.background}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.surface')}
                          </span>
                          <Input
                            type="text"
                            name="surfaceLight"
                            defaultValue={theme.definition.tokens.surface}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.foreground')}
                          </span>
                          <Input
                            type="text"
                            name="foregroundLight"
                            defaultValue={theme.definition.tokens.foreground}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.muted')}
                          </span>
                          <Input
                            type="text"
                            name="mutedLight"
                            defaultValue={theme.definition.tokens.muted}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.accent')}
                          </span>
                          <Input
                            type="text"
                            name="accentLight"
                            defaultValue={theme.definition.tokens.accent}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.border')}
                          </span>
                          <Input
                            type="text"
                            name="borderLight"
                            defaultValue={theme.definition.tokens.border}
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
                          <Input
                            type="text"
                            name="backgroundDark"
                            defaultValue={theme.definition.darkTokens.background}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.surface')}
                          </span>
                          <Input
                            type="text"
                            name="surfaceDark"
                            defaultValue={theme.definition.darkTokens.surface}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.foreground')}
                          </span>
                          <Input
                            type="text"
                            name="foregroundDark"
                            defaultValue={theme.definition.darkTokens.foreground}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.muted')}
                          </span>
                          <Input
                            type="text"
                            name="mutedDark"
                            defaultValue={theme.definition.darkTokens.muted}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.accent')}
                          </span>
                          <Input
                            type="text"
                            name="accentDark"
                            defaultValue={theme.definition.darkTokens.accent}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-medium text-[var(--theme-foreground)]">
                            {translateMessage(messages, 'admin.tokenLabels.border')}
                          </span>
                          <Input
                            type="text"
                            name="borderDark"
                            defaultValue={theme.definition.darkTokens.border}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button type="submit" variant="secondary" size="md">
                      {translateMessage(messages, 'admin.saveThemeButton')}
                    </Button>
                  </div>
                </form>
              </Card>
            );
          })}
        </div>
      </section>
    </section>
  );
}
