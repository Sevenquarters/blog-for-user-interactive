# Blog For User Interactive

Phase 1 establishes the project foundation for a bilingual blog platform built with Next.js, TypeScript, Tailwind CSS, Supabase, and Vercel.

## What Is Included

- Next.js App Router with TypeScript
- Tailwind CSS setup
- ESLint flat config and Prettier
- Next.js-native i18n foundation for English and Simplified Chinese
- Locale detection and persistence via middleware and cookie
- Theme provider architecture with token-driven CSS variables
- Supabase browser and server client helpers
- Environment variable template
- Base folder structure for future feature work

## What Is Not Included Yet

Phase 1 does not implement business features. There are no blog posts, auth flows, admin tools, comments, or dashboard behavior yet.

## Tech Decisions

- Framework: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- i18n: Next.js App Router locale routing with server-loaded dictionaries
- State sharing: React Context for locale and theme
- Backend platform: Supabase

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your Supabase values:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

The middleware redirects `/` to a locale-prefixed route such as `/zh-CN` or `/en` based on cookie preference or browser language.

## Environment Variables

`NEXT_PUBLIC_APP_URL`

- Public application URL used for local and deployment-aware configuration.

`NEXT_PUBLIC_SUPABASE_URL`

- Supabase project URL for browser and server clients.

`NEXT_PUBLIC_SUPABASE_ANON_KEY`

- Public anon key used by the browser-safe Supabase client.

`SUPABASE_SERVICE_ROLE_KEY`

- Reserved for future server-side admin operations.
- Never expose this value in client-side code.

## Project Structure

```text
src/
  app/
    [locale]/
  components/
    i18n/
    layout/
    theme/
  features/
    admin/
    auth/
    blog/
    media/
  i18n/
  lib/
    supabase/
    theme/
  providers/
  types/
```

## Available Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run lint` runs ESLint
- `npm run typecheck` runs the TypeScript compiler without emitting files
- `npm run format` formats the project with Prettier
- `npm run format:check` checks formatting without changing files

## Phase 1 Notes

- The default locale is `zh-CN`
- The locale cookie key is `blog-locale`
- Theme state persists locally and is ready to integrate with future admin-managed theme settings
- Supabase helpers are present, but no auth or data fetching flows are implemented yet
