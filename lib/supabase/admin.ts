import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// SERVER-SIDE ONLY. This uses the secret service role key, which bypasses
// all row-level security rules. Never import this file into anything that
// runs in the browser — only call it from files marked 'use server'.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
