import { NextResponse } from "next/server";

import { resolveApiDataAccess } from "@/lib/api-data-access";
import { getMockActiveShifts } from "@/lib/mock/time-tracking-store";
import { ActiveTimeEntry } from "@/lib/types/domain";

function mapStatus(status: string): ActiveTimeEntry["status"] {
  if (status === "on_break") return "on_break";
  if (status === "clocked_out") return "clocked_out";
  if (status === "flagged") return "flagged";
  return "clocked_in";
}

export async function GET() {
  try {
    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (access.kind === "mock") {
      const rows = getMockActiveShifts();
      return NextResponse.json({ data: rows, count: rows.length });
    }

    const supabase = access.supabase;

    const { data, error } = await supabase
      .from("active_time_entries_view")
      .select("*")
      .in("status", ["clocked_in", "on_break"])
      .order("employee_name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows: ActiveTimeEntry[] = (data ?? []).map((row) => ({
      id: row.id,
      employeeId: row.employee_id,
      employeeCode: row.employee_code ?? "N/A",
      employeeName: row.employee_name,
      storeId: row.store_id,
      storeName: row.store_name,
      status: mapStatus(row.status),
      regularHours: Number(row.regular_hours ?? 0),
      otHours: Number(row.ot_hours ?? 0),
      dtHours: Number(row.dt_hours ?? 0),
    }));

    return NextResponse.json({ data: rows, count: rows.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
