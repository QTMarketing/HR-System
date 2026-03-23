import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getEnvOptional } from "@/lib/env";
import type { Database } from "@/lib/types/supabase";

/** Server-only Supabase client with service role (bypasses RLS). Optional env. */
export function tryCreateServiceRoleClient(): SupabaseClient<Database> | null {
  const url = getEnvOptional("NEXT_PUBLIC_SUPABASE_URL");
  const key = getEnvOptional("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return null;
  }
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
