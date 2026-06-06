# Blog For User Interactive

Phase 2 establishes the database and authentication foundation for a bilingual blog platform built with Next.js, TypeScript, Tailwind CSS, Supabase, PostgreSQL, and Vercel.

## What Is Included

- Next.js App Router with TypeScript
- Tailwind CSS, ESLint, and Prettier
- Next.js-native i18n for English and Simplified Chinese
- Supabase SSR client setup for browser, server, and middleware contexts
- Supabase SQL migrations for schema, roles, RLS policies, and storage bucket setup
- Seed data for site settings, categories, tags, and the default theme
- Auth flows for login, logout, password reset, and profile loading
- Route protection for public, authenticated, and admin-only routes
- Reusable server-side database access modules

## What Is Not Included Yet

This phase does not build public blog pages, post management, comments UI, media management UI, or the admin content workflows.

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
  Used for auth redirect URLs and app-aware links.
- `NEXT_PUBLIC_SUPABASE_URL`
  Your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  Browser-safe publishable key used by the SSR client.
- `SUPABASE_SECRET_KEY`
  Reserved for future trusted server-side operations. Never expose it to the client.

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
2. Update that user’s `profiles.role` to `admin` in the database.

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

The middleware redirects `/` to `/{locale}` based on the saved locale cookie or browser language.

## Route Structure

Public routes:

- `/{locale}`
- `/{locale}/login`
- `/{locale}/reset-password`

Authenticated routes:

- `/{locale}/dashboard`
- `/{locale}/profile`
- `/{locale}/update-password`

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

## Phase 2 Notes

- The locale cookie key is `blog-locale`
- The default locale is `zh-CN`
- The protected route shell demonstrates session-aware route guarding without building blog features yet
- The admin route is restricted to the `admin` role
- Seed data creates a default active theme and starter taxonomy records
