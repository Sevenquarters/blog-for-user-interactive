create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'author'::public.app_role
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and public.current_app_role() = 'admin'::public.app_role
$$;

create or replace function public.is_editor_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and public.current_app_role() in ('admin'::public.app_role, 'editor'::public.app_role)
$$;

create or replace function public.can_manage_post(post_author_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (
      public.is_editor_or_admin()
      or post_author_id = auth.uid()
    )
$$;

create or replace function public.can_manage_media(owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and (
      public.is_editor_or_admin()
      or owner_id = auth.uid()
    )
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.category_translations enable row level security;
alter table public.tags enable row level security;
alter table public.tag_translations enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_asset_translations enable row level security;
alter table public.posts enable row level security;
alter table public.post_translations enable row level security;
alter table public.post_tags enable row level security;
alter table public.themes enable row level security;
alter table public.comments enable row level security;
alter table public.post_revisions enable row level security;
alter table public.post_views enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_setting_translations enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_self_or_admin" on public.profiles;
create policy "profiles_insert_self_or_admin"
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_delete_admin_only" on public.profiles;
create policy "profiles_delete_admin_only"
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
  on public.categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "categories_manage_editor_admin" on public.categories;
create policy "categories_manage_editor_admin"
  on public.categories
  for all
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

drop policy if exists "category_translations_public_read" on public.category_translations;
create policy "category_translations_public_read"
  on public.category_translations
  for select
  to anon, authenticated
  using (true);

drop policy if exists "category_translations_manage_editor_admin" on public.category_translations;
create policy "category_translations_manage_editor_admin"
  on public.category_translations
  for all
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

drop policy if exists "tags_public_read" on public.tags;
create policy "tags_public_read"
  on public.tags
  for select
  to anon, authenticated
  using (true);

drop policy if exists "tags_manage_editor_admin" on public.tags;
create policy "tags_manage_editor_admin"
  on public.tags
  for all
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

drop policy if exists "tag_translations_public_read" on public.tag_translations;
create policy "tag_translations_public_read"
  on public.tag_translations
  for select
  to anon, authenticated
  using (true);

drop policy if exists "tag_translations_manage_editor_admin" on public.tag_translations;
create policy "tag_translations_manage_editor_admin"
  on public.tag_translations
  for all
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

drop policy if exists "media_assets_public_read" on public.media_assets;
create policy "media_assets_public_read"
  on public.media_assets
  for select
  to anon, authenticated
  using (true);

drop policy if exists "media_assets_manage_owner_or_editor_admin" on public.media_assets;
create policy "media_assets_manage_owner_or_editor_admin"
  on public.media_assets
  for all
  to authenticated
  using (public.can_manage_media(uploaded_by))
  with check (public.can_manage_media(uploaded_by));

drop policy if exists "media_asset_translations_public_read" on public.media_asset_translations;
create policy "media_asset_translations_public_read"
  on public.media_asset_translations
  for select
  to anon, authenticated
  using (true);

drop policy if exists "media_asset_translations_manage_media_owners" on public.media_asset_translations;
create policy "media_asset_translations_manage_media_owners"
  on public.media_asset_translations
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.media_assets
      where public.media_assets.id = media_asset_id
        and public.can_manage_media(public.media_assets.uploaded_by)
    )
  )
  with check (
    exists (
      select 1
      from public.media_assets
      where public.media_assets.id = media_asset_id
        and public.can_manage_media(public.media_assets.uploaded_by)
    )
  );

drop policy if exists "posts_public_read_published" on public.posts;
create policy "posts_public_read_published"
  on public.posts
  for select
  to anon, authenticated
  using (
    status = 'published'::public.post_status
    and published_at is not null
    and published_at <= timezone('utc', now())
  );

drop policy if exists "posts_authenticated_read_own_or_elevated" on public.posts;
create policy "posts_authenticated_read_own_or_elevated"
  on public.posts
  for select
  to authenticated
  using (public.can_manage_post(author_id));

drop policy if exists "posts_insert_own_or_elevated" on public.posts;
create policy "posts_insert_own_or_elevated"
  on public.posts
  for insert
  to authenticated
  with check (public.can_manage_post(author_id));

drop policy if exists "posts_update_own_or_elevated" on public.posts;
create policy "posts_update_own_or_elevated"
  on public.posts
  for update
  to authenticated
  using (public.can_manage_post(author_id))
  with check (public.can_manage_post(author_id));

drop policy if exists "posts_delete_own_or_elevated" on public.posts;
create policy "posts_delete_own_or_elevated"
  on public.posts
  for delete
  to authenticated
  using (public.can_manage_post(author_id));

drop policy if exists "post_translations_public_read_published" on public.post_translations;
create policy "post_translations_public_read_published"
  on public.post_translations
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.posts
      where public.posts.id = post_id
        and public.posts.status = 'published'::public.post_status
        and public.posts.published_at is not null
        and public.posts.published_at <= timezone('utc', now())
    )
  );

drop policy if exists "post_translations_authenticated_read_manageable" on public.post_translations;
create policy "post_translations_authenticated_read_manageable"
  on public.post_translations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.posts
      where public.posts.id = post_id
        and public.can_manage_post(public.posts.author_id)
    )
  );

drop policy if exists "post_translations_manage_manageable_posts" on public.post_translations;
create policy "post_translations_manage_manageable_posts"
  on public.post_translations
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.posts
      where public.posts.id = post_id
        and public.can_manage_post(public.posts.author_id)
    )
  )
  with check (
    exists (
      select 1
      from public.posts
      where public.posts.id = post_id
        and public.can_manage_post(public.posts.author_id)
    )
  );

drop policy if exists "post_tags_public_read" on public.post_tags;
create policy "post_tags_public_read"
  on public.post_tags
  for select
  to anon, authenticated
  using (true);

drop policy if exists "post_tags_manage_manageable_posts" on public.post_tags;
create policy "post_tags_manage_manageable_posts"
  on public.post_tags
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.posts
      where public.posts.id = post_id
        and public.can_manage_post(public.posts.author_id)
    )
  )
  with check (
    exists (
      select 1
      from public.posts
      where public.posts.id = post_id
        and public.can_manage_post(public.posts.author_id)
    )
  );

drop policy if exists "themes_public_read_active" on public.themes;
create policy "themes_public_read_active"
  on public.themes
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "themes_admin_read_all" on public.themes;
create policy "themes_admin_read_all"
  on public.themes
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "themes_admin_manage" on public.themes;
create policy "themes_admin_manage"
  on public.themes
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "comments_public_read_approved" on public.comments;
create policy "comments_public_read_approved"
  on public.comments
  for select
  to anon, authenticated
  using (status = 'approved'::public.comment_status);

drop policy if exists "comments_authenticated_read_own_or_moderate" on public.comments;
create policy "comments_authenticated_read_own_or_moderate"
  on public.comments
  for select
  to authenticated
  using (author_id = auth.uid() or public.is_editor_or_admin());

drop policy if exists "comments_insert_pending" on public.comments;
create policy "comments_insert_pending"
  on public.comments
  for insert
  to anon, authenticated
  with check (
    status = 'pending'::public.comment_status
    and (
      author_id is null
      or author_id = auth.uid()
    )
  );

drop policy if exists "comments_moderate_editor_admin" on public.comments;
create policy "comments_moderate_editor_admin"
  on public.comments
  for update
  to authenticated
  using (public.is_editor_or_admin())
  with check (public.is_editor_or_admin());

drop policy if exists "comments_delete_editor_admin" on public.comments;
create policy "comments_delete_editor_admin"
  on public.comments
  for delete
  to authenticated
  using (public.is_editor_or_admin());

drop policy if exists "post_revisions_read_manageable_posts" on public.post_revisions;
create policy "post_revisions_read_manageable_posts"
  on public.post_revisions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.posts
      where public.posts.id = post_id
        and public.can_manage_post(public.posts.author_id)
    )
  );

drop policy if exists "post_revisions_insert_manageable_posts" on public.post_revisions;
create policy "post_revisions_insert_manageable_posts"
  on public.post_revisions
  for insert
  to authenticated
  with check (
    edited_by = auth.uid()
    and exists (
      select 1
      from public.posts
      where public.posts.id = post_id
        and public.can_manage_post(public.posts.author_id)
    )
  );

drop policy if exists "post_views_insert_public" on public.post_views;
create policy "post_views_insert_public"
  on public.post_views
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "post_views_read_editor_admin" on public.post_views;
create policy "post_views_read_editor_admin"
  on public.post_views
  for select
  to authenticated
  using (public.is_editor_or_admin());

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "site_settings_admin_manage" on public.site_settings;
create policy "site_settings_admin_manage"
  on public.site_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "site_setting_translations_public_read" on public.site_setting_translations;
create policy "site_setting_translations_public_read"
  on public.site_setting_translations
  for select
  to anon, authenticated
  using (true);

drop policy if exists "site_setting_translations_admin_manage" on public.site_setting_translations;
create policy "site_setting_translations_admin_manage"
  on public.site_setting_translations
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('blog-media', 'blog-media', true)
on conflict (id) do nothing;

drop policy if exists "blog_media_public_read" on storage.objects;
create policy "blog_media_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'blog-media');

drop policy if exists "blog_media_insert_authenticated" on storage.objects;
create policy "blog_media_insert_authenticated"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'blog-media'
    and public.current_app_role() in ('admin'::public.app_role, 'editor'::public.app_role, 'author'::public.app_role)
  );

drop policy if exists "blog_media_update_editor_admin" on storage.objects;
create policy "blog_media_update_editor_admin"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'blog-media'
    and public.is_editor_or_admin()
  )
  with check (
    bucket_id = 'blog-media'
    and public.is_editor_or_admin()
  );

drop policy if exists "blog_media_delete_editor_admin" on storage.objects;
create policy "blog_media_delete_editor_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'blog-media'
    and public.is_editor_or_admin()
  );
