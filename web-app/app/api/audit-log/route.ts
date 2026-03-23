import { NextResponse } from "next/server";

import { auditDetailFromJson } from "@/lib/audit-detail";
import { resolveApiDataAccess } from "@/lib/api-data-access";
import { getMockAuditLog, type AuditLogFilters } from "@/lib/mock/time-tracking-store";
import type { AuditLogRow } from "@/lib/types/domain";

export async function GET(request: Request) {
  try {
    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: AuditLogFilters = {
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      entityName: searchParams.get("entityName") ?? undefined,
      action: searchParams.get("action") ?? undefined,
    };

    if (access.kind === "mock") {
      return NextResponse.json({ data: getMockAuditLog(filters) });
    }

    const { supabase, userId } = access;

    const { data: roleRow, error: roleError } = await supabase.from("users").select("role").eq("id", userId).single();

    if (roleError || !roleRow) {
      return NextResponse.json({ error: "Unable to resolve user role" }, { status: 403 });
    }

    if (roleRow.role !== "admin" && roleRow.role !== "sub_admin") {
      return NextResponse.json(
        { error: "Audit log is visible only to admin and sub_admin roles." },
        { status: 403 },
      );
    }

    let query = supabase
      .from("audit_logs")
      .select("id, created_at, actor_user_id, entity_name, entity_id, action, reason_code, new_value")
      .order("created_at", { ascending: false })
      .limit(400);

    if (filters.from) {
      query = query.gte("created_at", `${filters.from}T00:00:00.000Z`);
    }
    if (filters.to) {
      const end = new Date(`${filters.to}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      query = query.lt("created_at", end.toISOString());
    }

    const { data: rows, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let list = rows ?? [];
    if (filters.entityName?.trim()) {
      const q = filters.entityName.trim().toLowerCase();
      list = list.filter((row) => row.entity_name.toLowerCase().includes(q));
    }
    if (filters.action?.trim()) {
      const q = filters.action.trim().toLowerCase();
      list = list.filter((row) => row.action.toLowerCase().includes(q));
    }
    list = list.slice(0, 200);
    const actorIds = Array.from(new Set(list.map((row) => row.actor_user_id)));

    let actors: { id: string; full_name: string }[] = [];
    if (actorIds.length > 0) {
      const { data: userRows, error: userError } = await supabase
        .from("users")
        .select("id, full_name")
        .in("id", actorIds);
      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 500 });
      }
      actors = userRows ?? [];
    }

    const nameById = new Map(actors.map((row) => [row.id, row.full_name]));

    const data: AuditLogRow[] = list.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      actorUserId: row.actor_user_id,
      actorName: nameById.get(row.actor_user_id) ?? "Unknown",
      entityName: row.entity_name,
      entityId: row.entity_id,
      action: row.action,
      reasonCode: row.reason_code,
      detail: auditDetailFromJson(row.new_value),
    }));

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
