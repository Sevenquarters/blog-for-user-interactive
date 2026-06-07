export type AppRole = 'admin' | 'editor' | 'author';

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: AppRole;
  preferred_locale: string;
  preferred_theme_mode: 'light' | 'dark' | 'system';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: number;
  default_locale: string;
  active_theme_id: string | null;
  posts_per_page: number;
  updated_by: string | null;
  updated_at: string;
  site_name: string;
  site_description: string | null;
};

export type TaxonomyItem = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
};

export type ThemeRecord = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  tokens: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
