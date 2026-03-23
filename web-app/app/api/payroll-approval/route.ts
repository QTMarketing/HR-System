import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveApiDataAccess } from "@/lib/api-data-access";
import { setMockPayrollApproval } from "@/lib/mock/time-tracking-store";

const bodySchema = z.object({
  timeEntryIds: z.array(z.uuid()).min(1).max(100),
  approved: z.boolean(),
});

export async function POST(request: Request) {
  try {
    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const json = await request.json();
    const input = bodySchema.parse(json);

    if (access.kind === "mock") {
      const approver = "Mock Admin";
      for (const id of input.timeEntryIds) {
        setMockPayrollApproval(id, input.approved, approver);
      }
      return NextResponse.json({ ok: true, updated: input.timeEntryIds.length });
    }

    const { supabase, userId } = access;

    const { data: roleRow, error: roleError } = await supabase.from("users").select("role").eq("id", userId).single();
    if (roleError || !roleRow) {
      return NextResponse.json({ error: "Unable to resolve user role" }, { status: 403 });
    }

    if (!["admin", "sub_admin", "store_manager"].includes(roleRow.role)) {
      return NextResponse.json({ error: "Insufficient permissions for payroll approval" }, { status: 403 });
    }

    const { data: actor, error: actorError } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", userId)
      .single();
    if (actorError || !actor) {
      return NextResponse.json({ error: "Unable to load actor profile" }, { status: 500 });
    }

    const now = new Date().toISOString();
    const payload = input.approved
      ? { payroll_approved_at: now, payroll_approved_by: userId, updated_at: now }
      : { payroll_approved_at: null, payroll_approved_by: null, updated_at: now };

    let updated = 0;
    for (const entryId of input.timeEntryIds) {
      const { data: existing, error: readError } = await supabase
        .from("time_entries")
        .select("id, store_id, clock_out_at")
        .eq("id", entryId)
        .single();

      if (readError || !existing || existing.clock_out_at === null) {
        continue;
      }

      const { error: upError } = await supabase.from("time_entries").update(payload).eq("id", entryId);
      if (!upError) {
        updated += 1;
      }
    }

    return NextResponse.json({ ok: true, updated, actorName: actor.full_name });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
