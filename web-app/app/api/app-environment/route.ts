import { NextResponse } from "next/server";

import { getDataMode } from "@/lib/data-mode";
import type { AppEnvironmentInfo } from "@/lib/types/domain";

/**
 * Non-secret flags for the settings UI (and dev clarity). No auth required.
 */
export async function GET() {
  const data: AppEnvironmentInfo = {
    dataMode: getDataMode(),
    requireSupabaseAuth: process.env.REQUIRE_SUPABASE_AUTH === "true",
    allowUnauthenticatedDev: process.env.ALLOW_UNAUTHENTICATED_DEV === "true",
  };
  return NextResponse.json({ data });
}
