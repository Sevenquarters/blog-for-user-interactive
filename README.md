# Blog For User Interactive

Next.js and Supabase blog platform with:

- bilingual UI in English and Simplified Chinese
- public blog pages
- authentication and role-aware protection
- editorial post management
- media library and cover image selection
- admin presentation and theme controls
- comment moderation foundation
- TipTap-based rich-text post editing for text-first authoring

## Current Phase Status

Completed:

- Phase 1 foundation
- Phase 2 database and authentication foundation
- Phase 3 public blog and content management foundation
- Phase 4 media, presentation management, and moderation foundation

Not implemented yet:

- public comment submission UI
- taxonomy management UI
- richer analytics dashboards
- visual theme builder
- automated end-to-end test suite

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- Vercel

## Key Product Notes

- The site UI is bilingual.
- Blog content storage remains translation-capable in the database.
- The current editor does not force authors to fill both locales for every post.
- The current TipTap rollout covers text formatting only; inline media and tables are not implemented yet.
- Roles are `author`, `editor`, and `admin`.

## Environment Variables

Create `.env.local` from `.env.example`.

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Optional but recommended:

- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SECRET_KEY`

Important:

- `NEXT_PUBLIC_SUPABASE_URL` must be the project base URL like `https://your-project-id.supabase.co`
- do not use the REST endpoint ending with `/rest/v1/`

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Create `.env.local`

```bash
cp .env.example .env.local
```

3. Fill in your Supabase values

4. Start the app

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

The root route redirects to a locale route based on the saved locale cookie or browser language.

## Supabase Setup

### Apply schema and seed data

Local stack:

```bash
supabase db reset
```

Hosted project:

```bash
supabase db push
```

If you need to apply seed data manually:

```bash
supabase db execute --file supabase/seed.sql
```

### Auth callback URLs

Add these URLs to Supabase Auth redirect settings for local development:

- `http://localhost:3000/en/auth/callback`
- `http://localhost:3000/zh-CN/auth/callback`

### First users and roles

When a user is created in Supabase Auth, the `handle_new_user` trigger creates the matching `profiles` row automatically.

Default role:

- new users start as `author`

To promote a user:

- update `public.profiles.role` to `editor` or `admin`

## Current Route Map

### Public

- `/{locale}`
- `/{locale}/blog`
- `/{locale}/blog/{slug}`
- `/{locale}/category/{slug}`
- `/{locale}/tag/{slug}`

### Auth

- `/{locale}/login`
- `/{locale}/reset-password`
- `/{locale}/update-password`
- `/{locale}/auth/callback`

### Protected

- `/{locale}/dashboard`
- `/{locale}/profile`
- `/{locale}/posts`
- `/{locale}/posts/new`
- `/{locale}/posts/{id}`

### Elevated moderation and media

- `/{locale}/media`
- `/{locale}/comments`

### Admin-only

- `/{locale}/admin`

## Current Feature Overview

### Public blog

- locale-aware home page
- blog archive
- post detail pages
- category and tag archive pages
- SEO metadata
- responsive layout
- lightweight post view tracking

### Editorial workflow

- protected post list
- create and edit post flow
- draft, scheduled, published, archived states
- revision history
- sample content generation
- cover image selection from stored media
- TipTap editor with headings, emphasis, links, quotes, code blocks, lists, and dividers

### Media

- image upload
- media preview
- translated alt text and captions
- replace image file
- delete media asset

### Admin presentation controls

- bilingual site name and description
- posts per page
- default locale
- active theme preset
- theme token editing for light and dark modes

### Moderation

- comment review list
- filter by moderation status
- approve, reject, mark spam, delete

## Project Structure

```text
src/
  app/
    [locale]/
      (protected)/
  components/
  i18n/
  lib/
    admin/
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

## Useful Commands

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run format`
- `npm run format:check`

## Verification Used In This Repository

The standard verification set is:

```bash
npm run lint
npm run typecheck
npm run build
```

For Phase 4 and later work, browser-based localhost verification is also recommended for:

- login and protected route access
- post editor flows
- media upload and replacement
- theme changes
- comment moderation pages

## Related Documentation

- [architecture.md](D:/git/blog-for-user-interactive/architecture.md)
- [roadmap.md](D:/git/blog-for-user-interactive/roadmap.md)
- [database-schema.md](D:/git/blog-for-user-interactive/database-schema.md)
