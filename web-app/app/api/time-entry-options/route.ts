import { NextResponse } from "next/server";

import { resolveApiDataAccess } from "@/lib/api-data-access";
import { getMockTimeEntryOptions } from "@/lib/mock/time-tracking-store";
import { EntryOption, TimeEntryOptions } from "@/lib/types/domain";
import { getViewerScopedStores } from "@/lib/viewer-store-scope";

export async function GET() {
  try {
    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (access.kind === "mock") {
      return NextResponse.json({ data: getMockTimeEntryOptions() });
    }

    const { supabase, userId } = access;

    const scope = await getViewerScopedStores(supabase, userId);
    if (!scope.ok) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const stores = scope.stores;

    const storeIds = Array.from(new Set(stores.map((store) => store.id)));
    if (storeIds.length === 0) {
      const empty: TimeEntryOptions = { employees: [], stores: [] };
      return NextResponse.json({ data: empty });
    }

    const { data: assignmentRows, error: assignmentError } = await supabase
      .from("user_store_assignments")
      .select("user_id")
      .in("store_id", storeIds);

    if (assignmentError) {
      return NextResponse.json({ error: assignmentError.message }, { status: 500 });
    }

    const employeeIds = Array.from(new Set((assignmentRows ?? []).map((row) => row.user_id)));

    const { data: employees, error: employeesError } = await supabase
      .from("users")
      .select("id, full_name, role")
      .in("id", employeeIds)
      .eq("role", "employee")
      .eq("status", "active")
      .order("full_name");

    if (employeesError) {
      return NextResponse.json({ error: employeesError.message }, { status: 500 });
    }

    const employeeOptions: EntryOption[] = (employees ?? []).map((employee) => ({
      id: employee.id,
      label: employee.full_name,
    }));

    const payload: TimeEntryOptions = {
      employees: employeeOptions,
      stores: stores.sort((a, b) => a.label.localeCompare(b.label)),
    };

    return NextResponse.json({ data: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
