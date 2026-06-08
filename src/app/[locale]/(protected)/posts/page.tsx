import Link from 'next/link';

import { ContentFlashMessage } from '@/components/content/content-flash-message';
import { PostStatusBadge } from '@/components/content/post-status-badge';
import { Badge, Button, Card, buttonClassName, cardClassName } from '@/components/ui';
import { isSupportedLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/dictionaries';
import { translateMessage } from '@/i18n/messages';
import { buildLocalePath } from '@/lib/auth/paths';
import { requireUser } from '@/lib/auth/session';
import { generateDemoPostsAction } from '@/lib/content/actions';
import { listManageablePosts } from '@/lib/db/content-posts';

type PostsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

function formatDate(locale: string, value: string | null) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

const SUCCESS_MESSAGES: Record<string, string> = {
  created: 'content.feedback.created',
  saved: 'content.feedback.saved',
  deleted: 'content.feedback.deleted',
  demoCreated: 'content.feedback.demoCreated',
  demoExists: 'content.feedback.demoExists',
};

const ERROR_MESSAGES: Record<string, string> = {
  invalidStatus: 'content.errors.invalidStatus',
  missingTitles: 'content.errors.missingTitles',
  incompletePublishedTranslations:
    'content.errors.incompletePublishedTranslations',
  missingPublishDate: 'content.errors.missingPublishDate',
  saveFailed: 'content.errors.saveFailed',
  deleteFailed: 'content.errors.deleteFailed',
  demoFailed: 'content.errors.demoFailed',
  postNotFound: 'content.errors.postNotFound',
};

export default async function PostsPage({
  params,
  searchParams,
}: PostsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!isSupportedLocale(locale)) {
    return null;
  }

  const messages = await getMessages(locale);
  const { profile } = await requireUser(locale);
  const { posts, scope } = await listManageablePosts(
    locale,
    profile.id,
    profile.role,
  );
  const demoAction = generateDemoPostsAction.bind(null, locale);
  const successPath = resolvedSearchParams.success
    ? SUCCESS_MESSAGES[resolvedSearchParams.success]
    : null;
  const errorPath = resolvedSearchParams.error
    ? ERROR_MESSAGES[resolvedSearchParams.error]
    : null;

  return (
    <section className="w-full space-y-6">
      <Card tone="hero" className="p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.24em] text-[var(--theme-accent)] uppercase">
              {translateMessage(messages, 'content.eyebrow')}
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--theme-foreground)]">
              {translateMessage(messages, 'content.title')}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--theme-muted)]">
              {translateMessage(
                messages,
                scope.canManageAllPosts
                  ? 'content.descriptionElevated'
                  : 'content.descriptionAuthor',
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <form action={demoAction}>
              <Button type="submit" variant="secondary" size="lg">
                {translateMessage(messages, 'content.generateDemo')}
              </Button>
            </form>
            <Link
              href={buildLocalePath(locale, '/posts/new')}
              className={buttonClassName({ variant: 'primary', size: 'lg' })}
            >
              {translateMessage(messages, 'content.newPost')}
            </Link>
          </div>
        </div>
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

      {posts.length === 0 ? (
        <div className={cardClassName({ tone: 'dashed', className: 'p-8 text-base leading-8 text-[var(--theme-muted)]' })}>
          {translateMessage(messages, 'content.emptyState')}
        </div>
      ) : (
        <div className="grid gap-5">
          {posts.map((post) => (
            <Card
              key={post.id}
              as="article"
              className="p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <PostStatusBadge
                      status={post.status}
                      label={translateMessage(messages, `content.status.${post.status}`)}
                    />
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold text-[var(--theme-foreground)]">
                      {post.translations[locale].title ||
                        post.translations.en.title ||
                        post.translations['zh-CN'].title ||
                        translateMessage(messages, 'content.untitled')}
                    </h2>
                    <p className="mt-2 text-sm text-[var(--theme-muted)]">
                      {translateMessage(messages, 'content.updatedLabel')}:{' '}
                      {formatDate(locale, post.updatedAt)}
                    </p>
                    <p className="mt-1 text-sm text-[var(--theme-muted)]">
                      {translateMessage(messages, 'content.publishedLabel')}:{' '}
                      {formatDate(locale, post.publishedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {post.category ? (
                      <Badge>
                        {post.category.name}
                      </Badge>
                    ) : null}
                    {post.tags.map((tag) => (
                      <Badge key={tag.id}>
                        #{tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Link
                  href={buildLocalePath(locale, `/posts/${post.id}`)}
                  className={buttonClassName({ variant: 'secondary', size: 'sm' })}
                >
                  {translateMessage(messages, 'content.editPost')}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
