# Roadmap

## 1. Delivery Goal

Build a bilingual, responsive blog platform with public pages, secure admin tooling, theme management, image storage, and Vercel deployment.

## 2. Recommended Delivery Phases

### Phase 0: Architecture Approval

Deliverables:

- approved architecture
- approved schema direction
- approved rendering strategy
- approved i18n approach

Exit criteria:

- architecture.md accepted
- roadmap.md accepted
- database-schema.md accepted

### Phase 1: Project Foundation

Deliverables:

- React + TypeScript project bootstrap
- TailwindCSS setup
- Supabase client integration
- environment configuration
- base layout, routing, and shared component structure
- `react-i18next` setup with English and Simplified Chinese translation files
- Next.js-native i18n setup with English and Simplified Chinese dictionaries

Acceptance criteria:

- app runs locally
- language switching works in navbar
- browser language detection works
- selected language persists
- responsive shell is in place

### Phase 2: Authentication and Access Control

Deliverables:

- login flow
- password reset flow
- profile setup
- role-based route protection
- auth-aware navigation

Acceptance criteria:

- unauthenticated users cannot reach admin routes
- admin/editor users can sign in successfully
- locale preference persists per user profile

### Phase 3: Database and Content Model

Deliverables:

- tables and relationships created
- RLS policies defined
- post translation model implemented
- comments model implemented
- revision history model implemented
- basic post view tracking implemented
- category/tag translation model implemented
- media metadata support implemented

Acceptance criteria:

- content can be created with separate English and Chinese versions
- public queries return only published content
- editor permissions are enforced

### Phase 4: Public Blog Experience

Deliverables:

- home page
- blog listing page
- blog detail page
- category/tag filtering
- SEO metadata support
- responsive article experience

Acceptance criteria:

- published posts render cleanly in both languages
- locale-aware navigation works
- pages perform well on mobile and desktop

### Phase 5: Admin Dashboard

Deliverables:

- dashboard shell
- post editor
- draft/publish workflow
- translation status indicators
- media manager

Acceptance criteria:

- editors can create and update bilingual posts
- authors can work on their own drafts within role limits
- admins can upload and attach images
- missing translation states are clear in the UI

### Phase 6: Theme Management

Deliverables:

- theme token model
- admin theme editor
- active theme switching
- public theme consumption via CSS variables

Acceptance criteria:

- admins can activate a theme without code changes
- theme updates appear consistently across public pages
- responsive behavior remains intact under all themes

### Phase 7: Hardening and Launch

Deliverables:

- QA pass
- accessibility pass
- error handling improvements
- deployment pipeline
- production environment setup

Acceptance criteria:

- preview deployments work
- production deployment is stable
- critical flows are tested

## 3. Suggested Build Order

1. Foundation and i18n shell
2. Auth and role protection
3. Schema and content services
4. Public blog pages
5. Admin content workflows
6. Theme management
7. QA, optimization, deployment

## 4. Major Workstreams

### Frontend

- routing and layouts
- component system
- responsive design
- i18n integration
- admin UX

### Backend

- schema creation
- RLS
- storage integration
- content queries and mutations

### Platform

- Vercel environments
- Supabase project configuration
- secrets management
- deployment checks

## 5. Risks and Mitigations

### Risk: SEO degradation if public pages are client-only

Mitigation:

- use Next.js rendering for public pages

### Risk: Translation drift between Chinese and English posts

Mitigation:

- separate translation records
- admin translation status indicators
- publish validation rules if needed

### Risk: Theme flexibility introduces UI inconsistency

Mitigation:

- constrain themes through design tokens
- validate token completeness before activation

### Risk: Storage becomes disorganized over time

Mitigation:

- track uploaded assets in database
- define naming conventions and ownership metadata

## 6. Recommended Milestone Reviews

Pause for review after:

1. project bootstrap and i18n shell
2. auth and schema completion
3. first public blog page end-to-end
4. admin editor completion
5. theme management completion

## 7. Definition of Done

The platform should be considered launch-ready when:

- public pages are bilingual and responsive
- admin workflows are secure
- all user-facing UI text is translatable
- content supports separate English and Chinese versions
- schema supports comments, revision history, and basic post view tracking
- image uploads and rendering work reliably
- active theme can be changed from the dashboard
- deployment works on Vercel with Supabase in production
