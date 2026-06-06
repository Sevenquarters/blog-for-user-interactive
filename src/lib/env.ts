type PublicEnv = {
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

type ServerEnv = PublicEnv & {
  SUPABASE_SERVICE_ROLE_KEY?: string;
};

function assertEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getPublicEnv(): PublicEnv {
  return {
    NEXT_PUBLIC_APP_URL: assertEnv(
      'NEXT_PUBLIC_APP_URL',
      process.env.NEXT_PUBLIC_APP_URL,
    ),
    NEXT_PUBLIC_SUPABASE_URL: assertEnv(
      'NEXT_PUBLIC_SUPABASE_URL',
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    ),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: assertEnv(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    ),
  };
}

export function getServerEnv(): ServerEnv {
  return {
    ...getPublicEnv(),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}
