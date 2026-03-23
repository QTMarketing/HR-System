import { NextResponse } from "next/server";

import { resolveApiDataAccess } from "@/lib/api-data-access";
import { getMockPolicyConfigs } from "@/lib/mock/time-tracking-store";
import type { PolicyConfigRow } from "@/lib/types/domain";

export async function GET() {
  try {
    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (access.kind === "mock") {
      return NextResponse.json({ data: getMockPolicyConfigs() });
    }

    const supabase = access.supabase;

    const { data: rows, error } = await supabase
      .from("policy_configs")
      .select(
        "id, store_id, overtime_daily_threshold, double_time_daily_threshold, overtime_weekly_threshold, auto_clock_out_hours, rounding_mode",
      )
      .order("store_id", { ascending: true, nullsFirst: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = rows ?? [];
    const storeIds = Array.from(
      new Set(list.map((row) => row.store_id).filter((id): id is string => id !== null && id !== undefined)),
    );

    let storeRows: { id: string; name: string }[] = [];
    if (storeIds.length > 0) {
      const { data: stores, error: storeError } = await supabase.from("stores").select("id, name").in("id", storeIds);
      if (storeError) {
        return NextResponse.json({ error: storeError.message }, { status: 500 });
      }
      storeRows = stores ?? [];
    }

    const storeNameById = new Map(storeRows.map((row) => [row.id, row.name]));

    const data: PolicyConfigRow[] = list.map((row) => ({
      id: row.id,
      storeId: row.store_id,
      storeName: row.store_id ? (storeNameById.get(row.store_id) ?? "Unknown store") : "Default (global)",
      overtimeDailyThreshold: Number(row.overtime_daily_threshold ?? 0),
      doubleTimeDailyThreshold: Number(row.double_time_daily_threshold ?? 0),
      overtimeWeeklyThreshold: Number(row.overtime_weekly_threshold ?? 0),
      autoClockOutHours: row.auto_clock_out_hours,
      roundingMode: row.rounding_mode,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
