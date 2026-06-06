create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'editor', 'author');
  end if;

  if not exists (select 1 from pg_type where typname = 'post_status') then
    create type public.post_status as enum ('draft', 'scheduled', 'published', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'comment_status') then
    create type public.comment_status as enum ('pending', 'approved', 'rejected', 'spam');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  display_name text,
  role public.app_role not null default 'author',
  preferred_locale text not null default 'zh-CN',
  preferred_theme_mode text not null default 'system'
    check (preferred_theme_mode in ('light', 'dark', 'system')),
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.category_translations (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  locale text not null,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint category_translations_category_locale_unique unique (category_id, locale),
  constraint category_translations_locale_slug_unique unique (locale, slug)
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tag_translations (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid not null references public.tags (id) on delete cascade,
  locale text not null,
  name text not null,
  slug text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tag_translations_tag_locale_unique unique (tag_id, locale),
  constraint tag_translations_locale_slug_unique unique (locale, slug)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  bucket_name text not null default 'blog-media',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  width integer,
  height integer,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media_asset_translations (
  id uuid primary key default gen_random_uuid(),
  media_asset_id uuid not null references public.media_assets (id) on delete cascade,
  locale text not null,
  alt_text text,
  caption text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint media_asset_translations_media_locale_unique unique (media_asset_id, locale)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete restrict,
  category_id uuid references public.categories (id) on delete set null,
  status public.post_status not null default 'draft',
  hero_media_id uuid references public.media_assets (id) on delete set null,
  published_at timestamptz,
  is_featured boolean not null default false,
  reading_time_minutes integer,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_translations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  locale text not null,
  title text not null,
  slug text not null,
  excerpt text,
  content jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text,
  cover_alt text,
  is_complete boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint post_translations_post_locale_unique unique (post_id, locale),
  constraint post_translations_locale_slug_unique unique (locale, slug)
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  is_active boolean not null default false,
  tokens jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists themes_single_active_idx
  on public.themes (is_active)
  where is_active = true;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  parent_comment_id uuid references public.comments (id) on delete set null,
  status public.comment_status not null default 'pending',
  author_name text,
  author_email text,
  content text not null,
  locale text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  translation_id uuid references public.post_translations (id) on delete set null,
  revision_number integer not null,
  edited_by uuid not null references public.profiles (id) on delete restrict,
  snapshot jsonb not null default '{}'::jsonb,
  change_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint post_revisions_post_revision_unique unique (post_id, revision_number)
);

create table if not exists public.post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  locale text not null,
  viewer_hash text,
  referrer text,
  user_agent text,
  viewed_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  default_locale text not null default 'zh-CN',
  active_theme_id uuid references public.themes (id) on delete set null,
  posts_per_page integer not null default 10,
  updated_by uuid references public.profiles (id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_setting_translations (
  id uuid primary key default gen_random_uuid(),
  site_settings_id integer not null references public.site_settings (id) on delete cascade,
  locale text not null,
  site_name text not null,
  site_description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint site_setting_translations_settings_locale_unique unique (site_settings_id, locale)
);

create index if not exists posts_status_published_at_idx
  on public.posts (status, published_at desc);

create index if not exists posts_author_id_idx
  on public.posts (author_id);

create index if not exists post_translations_locale_slug_idx
  on public.post_translations (locale, slug);

create index if not exists post_translations_locale_title_idx
  on public.post_translations (locale, title);

create index if not exists category_translations_locale_slug_idx
  on public.category_translations (locale, slug);

create index if not exists tag_translations_locale_slug_idx
  on public.tag_translations (locale, slug);

create index if not exists media_assets_uploaded_by_created_at_idx
  on public.media_assets (uploaded_by, created_at desc);

create index if not exists media_asset_translations_locale_media_idx
  on public.media_asset_translations (locale, media_asset_id);

create index if not exists comments_post_status_created_at_idx
  on public.comments (post_id, status, created_at desc);

create index if not exists post_revisions_post_revision_idx
  on public.post_revisions (post_id, revision_number desc);

create index if not exists post_views_post_viewed_at_idx
  on public.post_views (post_id, viewed_at desc);

create index if not exists site_setting_translations_locale_settings_idx
  on public.site_setting_translations (locale, site_settings_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'display_name',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.profiles.display_name),
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute procedure public.set_updated_at();

drop trigger if exists category_translations_set_updated_at on public.category_translations;
create trigger category_translations_set_updated_at
  before update on public.category_translations
  for each row execute procedure public.set_updated_at();

drop trigger if exists tags_set_updated_at on public.tags;
create trigger tags_set_updated_at
  before update on public.tags
  for each row execute procedure public.set_updated_at();

drop trigger if exists tag_translations_set_updated_at on public.tag_translations;
create trigger tag_translations_set_updated_at
  before update on public.tag_translations
  for each row execute procedure public.set_updated_at();

drop trigger if exists media_asset_translations_set_updated_at on public.media_asset_translations;
create trigger media_asset_translations_set_updated_at
  before update on public.media_asset_translations
  for each row execute procedure public.set_updated_at();

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();

drop trigger if exists post_translations_set_updated_at on public.post_translations;
create trigger post_translations_set_updated_at
  before update on public.post_translations
  for each row execute procedure public.set_updated_at();

drop trigger if exists themes_set_updated_at on public.themes;
create trigger themes_set_updated_at
  before update on public.themes
  for each row execute procedure public.set_updated_at();

drop trigger if exists comments_set_updated_at on public.comments;
create trigger comments_set_updated_at
  before update on public.comments
  for each row execute procedure public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute procedure public.set_updated_at();

drop trigger if exists site_setting_translations_set_updated_at on public.site_setting_translations;
create trigger site_setting_translations_set_updated_at
  before update on public.site_setting_translations
  for each row execute procedure public.set_updated_at();
