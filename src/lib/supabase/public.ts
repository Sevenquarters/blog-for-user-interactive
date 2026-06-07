import { createClient } from '@supabase/supabase-js';

import { getSupabasePublicEnv } from '@/lib/env';

let publicClient: ReturnType<typeof createClient> | undefined;

export function createSupabasePublicClient() {
  if (!publicClient) {
    const env = getSupabasePublicEnv();

    publicClient = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  return publicClient;
}

export function getSupabaseStoragePublicUrl(
  bucketName: string,
  storagePath: string,
) {
  const supabase = createSupabasePublicClient();
  const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath);

  return data.publicUrl;
}
