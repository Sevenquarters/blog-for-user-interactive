type SupabasePublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
};

const REQUIRED_SUPABASE_PUBLIC_ENV_NAMES = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
] as const;

type ServerEnv = SupabasePublicEnv & {
  SUPABASE_SECRET_KEY?: string;
};

function assertEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getSupabasePublicEnv(): SupabasePublicEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: assertEnv(
      'NEXT_PUBLIC_SUPABASE_URL',
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: assertEnv(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}

export function getServerEnv(): ServerEnv {
  return {
    ...getSupabasePublicEnv(),
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  };
}

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function getOptionalAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || undefined;
}

export function getMissingSupabaseEnvNames() {
  return REQUIRED_SUPABASE_PUBLIC_ENV_NAMES.filter(
    (name) => !process.env[name]?.trim(),
  );
}

export function isMissingSupabaseEnvError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.startsWith('Missing environment variable:')
  );
}
