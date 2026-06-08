import 'server-only';

import { createClient } from '@supabase/supabase-js';

import { getServerEnv } from '@/lib/env';

let adminClient: ReturnType<typeof createClient> | null = null;

export function createSupabaseAdminClient() {
  const env = getServerEnv();

  if (!env.SUPABASE_SECRET_KEY) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SECRET_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return adminClient;
}
