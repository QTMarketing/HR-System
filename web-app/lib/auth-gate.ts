import { isMockMode } from "@/lib/data-mode";

/**
 * Production-style login wall: set `REQUIRE_SUPABASE_AUTH=true` (with `DATA_MODE=api`).
 *
 * Default (unset / not `true`): dashboard and `/` never redirect to `/login`; `/login` sends you to `/overview`.
 * Optional escape hatch: `ALLOW_UNAUTHENTICATED_DEV=true` still bypasses the wall even when required auth is on
 * (local testing only).
 */
export function allowsDashboardWithoutAuth(): boolean {
  if (isMockMode()) {
    return true;
  }
  if (process.env.REQUIRE_SUPABASE_AUTH !== "true") {
    return true;
  }
  return process.env.ALLOW_UNAUTHENTICATED_DEV === "true";
}
