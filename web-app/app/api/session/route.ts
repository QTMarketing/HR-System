import { NextResponse } from "next/server";

import { resolveApiDataAccess } from "@/lib/api-data-access";
import type { SessionInfo } from "@/lib/types/domain";

/** Current viewer id + role for UI (policy edit, add employee, etc.). */
export async function GET() {
  try {
    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      const data: SessionInfo = { userId: null, role: null };
      return NextResponse.json({ data });
    }
    if (access.kind === "mock") {
      const data: SessionInfo = {
        userId: "00000000-0000-4000-8000-000000000001",
        role: "admin",
      };
      return NextResponse.json({ data });
    }

    const { supabase, userId } = access;
    const { data: row, error } = await supabase.from("users").select("role").eq("id", userId).single();
    if (error || !row) {
      const data: SessionInfo = { userId, role: null };
      return NextResponse.json({ data });
    }

    const data: SessionInfo = { userId, role: row.role };
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
