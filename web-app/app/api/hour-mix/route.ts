import { NextResponse } from "next/server";

import { resolveApiDataAccess } from "@/lib/api-data-access";
import { getMockHourMix } from "@/lib/mock/time-tracking-store";
import { HourMixData } from "@/lib/types/domain";

export async function GET() {
  try {
    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (access.kind === "mock") {
      return NextResponse.json({ data: getMockHourMix() });
    }

    const supabase = access.supabase;

    const { data: rows, error } = await supabase
      .from("time_entries")
      .select("regular_hours, ot_hours, dt_hours")
      .is("clock_out_at", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const regular = (rows ?? []).reduce((sum, row) => sum + Number(row.regular_hours ?? 0), 0);
    const ot = (rows ?? []).reduce((sum, row) => sum + Number(row.ot_hours ?? 0), 0);
    const dt = (rows ?? []).reduce((sum, row) => sum + Number(row.dt_hours ?? 0), 0);

    const payload: HourMixData = {
      totalHours: Math.round((regular + ot + dt) * 100) / 100,
      segments: [
        { name: "Regular", value: Math.round(regular * 100) / 100 },
        { name: "OT", value: Math.round(ot * 100) / 100 },
        { name: "DT", value: Math.round(dt * 100) / 100 },
      ],
    };

    return NextResponse.json({ data: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
