# Blog For User Interactive

The project currently includes the Phase 2 foundation plus the Phase 3 public bilingual blog experience and the first admin content management foundation.

## What Is Included

- Next.js App Router with TypeScript
- Tailwind CSS, ESLint, and Prettier
- Next.js-native i18n for English and Simplified Chinese
- Supabase SSR client setup for browser, server, and proxy contexts
- Supabase SQL migrations for schema, roles, RLS policies, and storage bucket setup
- Seed data for site settings, categories, tags, and the default theme
- Auth flows for login, logout, password reset, and profile loading
- Route protection for public, authenticated, and admin-only routes
- Reusable server-side database access modules
- Public bilingual home page, blog listing, post detail pages, and category/tag archives
- Published-only content queries with SEO metadata and responsive public layouts
- Basic post view tracking integration
- Protected post management with bilingual create, edit, delete, and draft or publish workflow
- Translation completeness indicators and revision history viewing
- Role-aware content permissions for `author`, `editor`, and `admin`
- In-app demo post generation for Phase 3 verification

## What Is Not Included Yet

The current implementation does not yet include:

- comment submission or moderation UI
- media manager UI
- theme editor UI
- advanced admin analytics dashboards
- rich post editor or side-by-side translation tools

## Tech Decisions

- Framework: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- i18n: locale-prefixed App Router routing with server-loaded dictionaries
- Auth and database: Supabase
- Shared client state: React Context for locale and theme

## Supabase Structure

The repository includes:

- Schema migration: [supabase/migrations/20260606232000_initial_schema.sql](D:/git/blog-for-user-interactive/supabase/migrations/20260606232000_initial_schema.sql)
- RLS and policy migration: [supabase/migrations/20260606232100_rls_policies.sql](D:/git/blog-for-user-interactive/supabase/migrations/20260606232100_rls_policies.sql)
- Seed data: [supabase/seed.sql](D:/git/blog-for-user-interactive/supabase/seed.sql)

The schema includes:

- `profiles`
- `posts`
- `post_translations`
- `categories` and `category_translations`
- `tags` and `tag_translations`
- `post_tags`
- `media_assets` and `media_asset_translations`
- `themes`
- `comments`
- `post_revisions`
- `post_views`
- `site_settings` and `site_setting_translations`

## Environment Variables

Copy the template first:

```bash
cp .env.example .env.local
```

Required values:

- `NEXT_PUBLIC_APP_URL`
  Optional but recommended. Used as the canonical base URL for auth email redirects when explicitly configured.
  If omitted, the password reset flow falls back to the current request origin.
- `NEXT_PUBLIC_SUPABASE_URL`
  Your Supabase project base URL, such as `https://your-project-id.supabase.co`.
  Do not use the REST API endpoint ending with `/rest/v1/`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  Browser-safe publishable key used by the SSR client.
- `SUPABASE_SECRET_KEY`
  Reserved for future trusted server-side operations. Never expose it to the client.

For local development, place these values in `.env.local`.

For Vercel deployment, create the same variables in the Vercel project settings for:

- Production
- Preview
- Development, if you use `vercel env pull`

## Supabase Setup

### 1. Create or link a Supabase project

Create a Supabase project in the dashboard, then either:

- use a local Supabase stack, or
- link this repository to a hosted project with the Supabase CLI

### 2. Configure auth redirect URLs

Add these redirect URLs in Supabase Auth settings for local development:

- `http://localhost:3000/en/auth/callback`
- `http://localhost:3000/zh-CN/auth/callback`

### 3. Apply the migrations

For a local Supabase stack:

```bash
supabase db reset
```

For a linked hosted project:

```bash
supabase db push
```

The seed file is designed to run automatically with `supabase db reset`. If you need to apply it manually:

```bash
supabase db execute --file supabase/seed.sql
```

### 4. Create at least one auth user

The `handle_new_user` trigger automatically creates a matching `profiles` row when a user is created in Supabase Auth.

If you need an initial admin user:

1. Create the user in Supabase Auth.
2. Update that user's `profiles.role` to `admin` in the database.

New users default to the `author` role.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Fill in `.env.local`

3. Start the app:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

The Next.js proxy redirects `/` to `/{locale}` based on the saved locale cookie or browser language.

## Vercel Notes

- Set `NEXT_PUBLIC_SUPABASE_URL` to the project base URL without `/rest/v1/`
- Set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in every environment where auth should work
- Set `NEXT_PUBLIC_APP_URL` to your deployed site URL if you want explicit password reset redirect URLs
- Keep `SUPABASE_SECRET_KEY` server-only and never expose it through client code

## Route Structure

Public routes:

- `/{locale}`
- `/{locale}/blog`
- `/{locale}/blog/{slug}`
- `/{locale}/category/{slug}`
- `/{locale}/tag/{slug}`
- `/{locale}/login`
- `/{locale}/reset-password`

Authenticated routes:

- `/{locale}/dashboard`
- `/{locale}/profile`
- `/{locale}/update-password`
- `/{locale}/posts`
- `/{locale}/posts/new`
- `/{locale}/posts/{id}`

Admin-only routes:

- `/{locale}/admin`

Auth callback route:

- `/{locale}/auth/callback`

## Project Structure

```text
src/
  app/
    [locale]/
      (protected)/
      auth/
  components/
    auth/
    i18n/
    layout/
    theme/
  i18n/
  lib/
    auth/
    db/
    supabase/
    theme/
  providers/
  types/
supabase/
  migrations/
  seed.sql
```

## Available Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run lint` runs ESLint
- `npm run typecheck` runs the TypeScript compiler without emitting files
- `npm run format` formats the project with Prettier
- `npm run format:check` checks formatting without changing files

## Demo Content

To create sample published bilingual posts for verification:

1. Sign in with an authenticated account.
2. Open `/{locale}/posts`.
3. Use the `Generate demo posts` action.

The demo generator creates published English and Simplified Chinese posts for the current signed-in author and skips duplicates when the expected sample posts already exist.

Content permissions follow the role model:

- `author` can manage only their own posts
- `editor` can manage posts across the workspace
- `admin` can manage posts across the workspace and access admin-only routes

## Current Notes

- The locale cookie key is `blog-locale`
- The default locale is `zh-CN`
- The root route redirects to a locale route through Next.js proxy middleware
- The admin route is restricted to the `admin` role
- Seed data creates a default active theme and starter taxonomy records
- Public blog pages only read published content
- Post management records revision snapshots on each save
- Published posts require complete English and Simplified Chinese content
