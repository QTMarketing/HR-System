import type { SupabaseClient } from "@supabase/supabase-js";

import type { EntryOption } from "@/lib/types/domain";
import type { Database } from "@/lib/types/supabase";

export type ViewerScopedStoresResult =
  | { ok: true; stores: EntryOption[] }
  | { ok: false; error: string; status: number };

/**
 * Active stores the signed-in user may access (admin: all active stores; others: assigned stores).
 * Mirrors logic used for time-entry options and employee roster.
 */
export async function getViewerScopedStores(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ViewerScopedStoresResult> {
  const { data: roleRow, error: roleError } = await supabase.from("users").select("role").eq("id", userId).single();

  if (roleError || !roleRow) {
    return { ok: false, error: "Unable to resolve user role", status: 403 };
  }

  const isAdmin = roleRow.role === "admin";
  let stores: EntryOption[] = [];

  if (isAdmin) {
    const { data, error } = await supabase.from("stores").select("id, name").eq("is_active", true).order("name");
    if (error) {
      return { ok: false, error: error.message, status: 500 };
    }
    stores = (data ?? []).map((store) => ({ id: store.id, label: store.name }));
  } else {
    const { data: assignmentRows, error } = await supabase
      .from("user_store_assignments")
      .select("store_id")
      .eq("user_id", userId);

    if (error) {
      return { ok: false, error: error.message, status: 500 };
    }

    const storeIds = Array.from(new Set((assignmentRows ?? []).map((row) => row.store_id)));
    if (storeIds.length > 0) {
      const { data: storeRows, error: storeError } = await supabase
        .from("stores")
        .select("id, name")
        .in("id", storeIds)
        .eq("is_active", true);

      if (storeError) {
        return { ok: false, error: storeError.message, status: 500 };
      }

      stores = (storeRows ?? []).map((store) => ({ id: store.id, label: store.name }));
    }
  }

  return { ok: true, stores: stores.sort((a, b) => a.label.localeCompare(b.label)) };
}
