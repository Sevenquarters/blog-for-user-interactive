insert into public.themes (
  id,
  name,
  slug,
  is_active,
  tokens,
  created_by
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Editorial Sunrise',
  'editorial-sunrise',
  true,
  '{
    "background": "#fffdf8",
    "surface": "rgba(255, 255, 255, 0.88)",
    "foreground": "#1f2937",
    "muted": "#5b6472",
    "accent": "#c2410c",
    "border": "rgba(148, 163, 184, 0.28)",
    "dark": {
      "background": "#111827",
      "surface": "rgba(17, 24, 39, 0.92)",
      "foreground": "#f8fafc",
      "muted": "#cbd5e1",
      "accent": "#f59e0b",
      "border": "rgba(148, 163, 184, 0.26)"
    }
  }'::jsonb,
  null
)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  is_active = excluded.is_active,
  tokens = excluded.tokens;

insert into public.site_settings (
  id,
  default_locale,
  active_theme_id,
  posts_per_page,
  updated_by
)
values (
  1,
  'zh-CN',
  '11111111-1111-1111-1111-111111111111',
  10,
  null
)
on conflict (id) do update
set
  default_locale = excluded.default_locale,
  active_theme_id = excluded.active_theme_id,
  posts_per_page = excluded.posts_per_page;

insert into public.site_setting_translations (
  id,
  site_settings_id,
  locale,
  site_name,
  site_description
)
values
  (
    '21111111-1111-1111-1111-111111111111',
    1,
    'en',
    'Blog For User Interactive',
    'A bilingual interactive blog platform powered by Supabase and Next.js.'
  ),
  (
    '21111111-1111-1111-1111-111111111112',
    1,
    'zh-CN',
    '用户交互式博客平台',
    '一个基于 Supabase 和 Next.js 的双语互动博客平台。'
  )
on conflict (site_settings_id, locale) do update
set
  site_name = excluded.site_name,
  site_description = excluded.site_description;

insert into public.categories (id, sort_order)
values
  ('31111111-1111-1111-1111-111111111111', 1),
  ('31111111-1111-1111-1111-111111111112', 2),
  ('31111111-1111-1111-1111-111111111113', 3)
on conflict (id) do update
set sort_order = excluded.sort_order;

insert into public.category_translations (
  id,
  category_id,
  locale,
  name,
  slug,
  description
)
values
  (
    '41111111-1111-1111-1111-111111111111',
    '31111111-1111-1111-1111-111111111111',
    'en',
    'Engineering',
    'engineering',
    'Platform architecture, infrastructure, and implementation notes.'
  ),
  (
    '41111111-1111-1111-1111-111111111112',
    '31111111-1111-1111-1111-111111111111',
    'zh-CN',
    '工程实践',
    'engineering',
    '平台架构、基础设施与实现记录。'
  ),
  (
    '41111111-1111-1111-1111-111111111113',
    '31111111-1111-1111-1111-111111111112',
    'en',
    'Product',
    'product',
    'Editorial planning, product thinking, and roadmap updates.'
  ),
  (
    '41111111-1111-1111-1111-111111111114',
    '31111111-1111-1111-1111-111111111112',
    'zh-CN',
    '产品设计',
    'product',
    '编辑规划、产品思考与路线图更新。'
  ),
  (
    '41111111-1111-1111-1111-111111111115',
    '31111111-1111-1111-1111-111111111113',
    'en',
    'Design System',
    'design-system',
    'Theme tokens, UI standards, and visual system decisions.'
  ),
  (
    '41111111-1111-1111-1111-111111111116',
    '31111111-1111-1111-1111-111111111113',
    'zh-CN',
    '设计系统',
    'design-system',
    '主题令牌、界面规范与视觉系统决策。'
  )
on conflict (category_id, locale) do update
set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description;

insert into public.tags (id)
values
  ('51111111-1111-1111-1111-111111111111'),
  ('51111111-1111-1111-1111-111111111112'),
  ('51111111-1111-1111-1111-111111111113')
on conflict (id) do nothing;

insert into public.tag_translations (
  id,
  tag_id,
  locale,
  name,
  slug
)
values
  (
    '61111111-1111-1111-1111-111111111111',
    '51111111-1111-1111-1111-111111111111',
    'en',
    'React',
    'react'
  ),
  (
    '61111111-1111-1111-1111-111111111112',
    '51111111-1111-1111-1111-111111111111',
    'zh-CN',
    'React',
    'react'
  ),
  (
    '61111111-1111-1111-1111-111111111113',
    '51111111-1111-1111-1111-111111111112',
    'en',
    'TypeScript',
    'typescript'
  ),
  (
    '61111111-1111-1111-1111-111111111114',
    '51111111-1111-1111-1111-111111111112',
    'zh-CN',
    'TypeScript',
    'typescript'
  ),
  (
    '61111111-1111-1111-1111-111111111115',
    '51111111-1111-1111-1111-111111111113',
    'en',
    'Supabase',
    'supabase'
  ),
  (
    '61111111-1111-1111-1111-111111111116',
    '51111111-1111-1111-1111-111111111113',
    'zh-CN',
    'Supabase',
    'supabase'
  )
on conflict (tag_id, locale) do update
set
  name = excluded.name,
  slug = excluded.slug;
