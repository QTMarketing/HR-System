import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveApiDataAccess } from "@/lib/api-data-access";
import { getMockPolicyConfigs, patchMockPolicyConfig, type PolicyConfigNumericPatch } from "@/lib/mock/time-tracking-store";

const patchSchema = z
  .object({
    overtimeDailyThreshold: z.number().min(0).max(24).optional(),
    doubleTimeDailyThreshold: z.number().min(0).max(24).optional(),
    overtimeWeeklyThreshold: z.number().min(0).max(168).optional(),
    autoClockOutHours: z.number().int().min(1).max(48).optional(),
    roundingMode: z.string().min(1).max(40).optional(),
  })
  .strict();

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = patchSchema.parse(await request.json());
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    if (access.kind === "mock") {
      const configs = getMockPolicyConfigs();
      if (!configs.some((row) => row.id === id)) {
        return NextResponse.json({ error: "Policy not found" }, { status: 404 });
      }
      patchMockPolicyConfig(id, body as PolicyConfigNumericPatch);
      const next = getMockPolicyConfigs().find((row) => row.id === id);
      return NextResponse.json({ data: next });
    }

    const { supabase, userId } = access;

    const { data: roleRow, error: roleError } = await supabase.from("users").select("role").eq("id", userId).single();
    if (roleError || !roleRow || roleRow.role !== "admin") {
      return NextResponse.json({ error: "Only admin can update policy configuration" }, { status: 403 });
    }

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.overtimeDailyThreshold !== undefined) {
      updatePayload.overtime_daily_threshold = body.overtimeDailyThreshold;
    }
    if (body.doubleTimeDailyThreshold !== undefined) {
      updatePayload.double_time_daily_threshold = body.doubleTimeDailyThreshold;
    }
    if (body.overtimeWeeklyThreshold !== undefined) {
      updatePayload.overtime_weekly_threshold = body.overtimeWeeklyThreshold;
    }
    if (body.autoClockOutHours !== undefined) {
      updatePayload.auto_clock_out_hours = body.autoClockOutHours;
    }
    if (body.roundingMode !== undefined) {
      updatePayload.rounding_mode = body.roundingMode;
    }

    const { data, error } = await supabase.from("policy_configs").update(updatePayload).eq("id", id).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    let storeName = "Default (global)";
    if (data.store_id) {
      const { data: storeRow } = await supabase.from("stores").select("name").eq("id", data.store_id).single();
      storeName = storeRow?.name ?? "Unknown store";
    }

    return NextResponse.json({
      data: {
        id: data.id,
        storeId: data.store_id,
        storeName,
        overtimeDailyThreshold: Number(data.overtime_daily_threshold),
        doubleTimeDailyThreshold: Number(data.double_time_daily_threshold),
        overtimeWeeklyThreshold: Number(data.overtime_weekly_threshold),
        autoClockOutHours: data.auto_clock_out_hours,
        roundingMode: data.rounding_mode,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
