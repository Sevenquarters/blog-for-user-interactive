# Roadmap

## Current Status

The repository is now beyond the original bootstrap stage. The implemented work is:

- Phase 1 foundation complete
- Phase 2 database and authentication foundation complete
- Phase 3 public blog and content management foundation complete
- Phase 4 media, presentation management, and moderation foundation complete
- TipTap Stage 2A text-editor rollout complete

## Completed Phases

### Phase 1: Foundation

Completed:

- Next.js App Router with TypeScript
- Tailwind CSS
- ESLint and Prettier
- locale-prefixed routing
- browser locale detection and persistence
- theme provider foundation
- Supabase client setup
- environment templates

### Phase 2: Database and authentication

Completed:

- Supabase SQL migrations
- Row Level Security policies
- `admin`, `editor`, `author` roles
- login, logout, password reset, and profile loading
- protected route guards
- shared database access layer
- seed data for site settings, categories, tags, and default theme

### Phase 3: Public blog and editorial foundation

Completed:

- locale-aware home page
- public blog archive and post detail pages
- category and tag archive browsing
- SEO metadata support
- published-only public queries
- post view tracking
- protected post CRUD
- draft, scheduled, published, archived workflow
- revision history viewing
- sample content generation
- single-content-first authoring flow on top of translation-capable storage

### Phase 4: Media and presentation management

Completed:

- protected media library for editors and admins
- image upload, preview, text updates, replace, and delete
- cover image selection in the post editor
- admin presentation settings for site name, description, default locale, posts per page, and active theme
- theme token editing and theme activation
- comment moderation views for editors and admins
- documentation cleanup for current project state

## What Is Intentionally Not Done Yet

- public comment submission UI
- taxonomy management UI
- rich media browsing modal in the editor
- advanced analytics dashboards
- visual drag-and-drop theme builder
- deployment hardening and launch checklist completion
- automated integration or end-to-end test suite

## Recommended Next Phase

### Phase 5: Editorial Operations and Hardening

Suggested scope:

- category and tag management UI
- richer dashboard metrics
- public comment submission flow with moderation integration
- better media browsing and search in the editor
- validation polish and empty-state UX improvements
- stronger testing coverage for auth, content, media, and moderation flows

## Optional Parallel Workstreams

### Editorial UX

- TipTap text editor complete for text-first authoring
- inline media insertion pending
- table support pending
- preview workflow
- scheduled publishing review tools

### Community features

- public comments
- moderation filters and bulk actions

### Platform quality

- test automation
- deployment verification checklist
- accessibility review
- performance review

## Definition Of Current Project Readiness

The project is currently ready for:

- local development
- authenticated editorial testing
- public blog browsing verification
- theme and site identity iteration
- media workflow validation

The project is not yet fully launch-ready for a production content operation because moderation, analytics, taxonomy management, automated testing, and release hardening are still partial.
