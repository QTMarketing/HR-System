import type { SupabaseClient } from "@supabase/supabase-js";

import { isMockMode } from "@/lib/data-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/supabase";

export type ApiDataAccess =
  | { kind: "mock" }
  | { kind: "supabase"; supabase: SupabaseClient<Database>; userId: string }
  | { kind: "unauthorized" };

/**
 * Resolves whether route handlers should use in-memory mock data or Supabase.
 *
 * - `DATA_MODE=mock` → always mock.
 * - `DATA_MODE=api` + signed-in user → Supabase.
 * - `DATA_MODE=api` + no user + `REQUIRE_SUPABASE_AUTH` not `true` → mock (dev default; no login).
 * - `DATA_MODE=api` + no user + `ALLOW_UNAUTHENTICATED_DEV=true` → mock (explicit dev bypass when auth is required).
 * - `DATA_MODE=api` + no user + `REQUIRE_SUPABASE_AUTH=true` and no bypass → unauthorized (401).
 */
export async function resolveApiDataAccess(): Promise<ApiDataAccess> {
  if (isMockMode()) {
    return { kind: "mock" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return { kind: "supabase", supabase, userId: user.id };
  }

  if (process.env.ALLOW_UNAUTHENTICATED_DEV === "true") {
    return { kind: "mock" };
  }

  if (process.env.REQUIRE_SUPABASE_AUTH !== "true") {
    return { kind: "mock" };
  }

  return { kind: "unauthorized" };
}
