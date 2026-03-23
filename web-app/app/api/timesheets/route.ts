import { NextResponse } from "next/server";

import { resolveApiDataAccess } from "@/lib/api-data-access";
import { getMockTimesheetRows } from "@/lib/mock/time-tracking-store";
import type { TimesheetRow } from "@/lib/types/domain";

export async function GET(request: Request) {
  try {
    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId") ?? undefined;
    const from = searchParams.get("from") ?? undefined;
    const to = searchParams.get("to") ?? undefined;
    const filters = { storeId, from, to };

    if (access.kind === "mock") {
      return NextResponse.json({ data: getMockTimesheetRows(filters) });
    }

    const supabase = access.supabase;

    let query = supabase
      .from("time_entries")
      .select(
        "id, employee_id, store_id, clock_in_at, clock_out_at, status, regular_hours, ot_hours, dt_hours, payroll_approved_at, payroll_approved_by",
      )
      .not("clock_out_at", "is", null)
      .order("clock_in_at", { ascending: false })
      .limit(500);

    if (storeId) {
      query = query.eq("store_id", storeId);
    }
    if (from) {
      query = query.gte("clock_in_at", `${from}T00:00:00.000Z`);
    }
    if (to) {
      const end = new Date(`${to}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      query = query.lt("clock_in_at", end.toISOString());
    }

    const { data: rows, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = rows ?? [];
    const empIds = Array.from(new Set(list.map((row) => row.employee_id)));
    const stIds = Array.from(new Set(list.map((row) => row.store_id)));

    let userRows: { id: string; full_name: string }[] = [];
    let storeRows: { id: string; name: string }[] = [];
    let profileRows: { user_id: string; employee_code: string }[] = [];
    let approverRows: { id: string; full_name: string }[] = [];

    const approverIds = Array.from(
      new Set(
        list
          .map((row) => row.payroll_approved_by)
          .filter((id): id is string => typeof id === "string" && id.length > 0),
      ),
    );

    if (approverIds.length > 0) {
      const { data: appr, error: apprError } = await supabase.from("users").select("id, full_name").in("id", approverIds);
      if (apprError) {
        return NextResponse.json({ error: apprError.message }, { status: 500 });
      }
      approverRows = appr ?? [];
    }

    if (empIds.length > 0) {
      const { data: u, error: userError } = await supabase.from("users").select("id, full_name").in("id", empIds);
      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: 500 });
      }
      userRows = u ?? [];

      const { data: p, error: profileError } = await supabase
        .from("employee_profiles")
        .select("user_id, employee_code")
        .in("user_id", empIds);
      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
      profileRows = p ?? [];
    }

    if (stIds.length > 0) {
      const { data: s, error: storeError } = await supabase.from("stores").select("id, name").in("id", stIds);
      if (storeError) {
        return NextResponse.json({ error: storeError.message }, { status: 500 });
      }
      storeRows = s ?? [];
    }

    const nameByUser = new Map(userRows.map((row) => [row.id, row.full_name]));
    const storeById = new Map(storeRows.map((row) => [row.id, row.name]));
    const codeByUser = new Map(profileRows.map((row) => [row.user_id, row.employee_code]));
    const approverNameById = new Map(approverRows.map((row) => [row.id, row.full_name]));

    function mapStatus(status: string): TimesheetRow["status"] {
      if (status === "on_break") return "on_break";
      if (status === "flagged") return "flagged";
      if (status === "clocked_out") return "clocked_out";
      return "clocked_in";
    }

    const data: TimesheetRow[] = list.map((row) => ({
      id: row.id,
      employeeId: row.employee_id,
      employeeName: nameByUser.get(row.employee_id) ?? "Unknown",
      employeeCode: codeByUser.get(row.employee_id) ?? "—",
      storeId: row.store_id,
      storeName: storeById.get(row.store_id) ?? "Unknown",
      clockInAt: row.clock_in_at,
      clockOutAt: row.clock_out_at!,
      status: mapStatus(row.status),
      regularHours: Number(row.regular_hours ?? 0),
      otHours: Number(row.ot_hours ?? 0),
      dtHours: Number(row.dt_hours ?? 0),
      payrollApprovedAt: row.payroll_approved_at,
      payrollApprovedByName: row.payroll_approved_by
        ? (approverNameById.get(row.payroll_approved_by) ?? null)
        : null,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
