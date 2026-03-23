import { NextResponse } from "next/server";
import { z } from "zod";

import { resolveApiDataAccess } from "@/lib/api-data-access";
import { getMockEmployeeRoster } from "@/lib/mock/time-tracking-store";
import { tryCreateServiceRoleClient } from "@/lib/supabase/service";
import type { EmployeeRosterData, EmployeeRosterStoreGroup, RosterEmployee } from "@/lib/types/domain";
import { getViewerScopedStores } from "@/lib/viewer-store-scope";

const createEmployeeBody = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  fullName: z.string().min(1).max(120),
  employeeCode: z.string().min(2).max(32).regex(/^[A-Za-z0-9_-]+$/),
  storeIds: z.array(z.uuid()).min(1),
  primaryStoreId: z.uuid().optional(),
});

export async function GET() {
  try {
    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (access.kind === "mock") {
      return NextResponse.json({ data: getMockEmployeeRoster() });
    }

    const { supabase, userId } = access;

    const scope = await getViewerScopedStores(supabase, userId);
    if (!scope.ok) {
      return NextResponse.json({ error: scope.error }, { status: scope.status });
    }

    const stores = scope.stores;
    if (stores.length === 0) {
      const empty: EmployeeRosterData = { byStore: [], uniqueEmployeeCount: 0 };
      return NextResponse.json({ data: empty });
    }

    const storeIds = stores.map((store) => store.id);

    const { data: assignmentRows, error: assignmentError } = await supabase
      .from("user_store_assignments")
      .select("user_id, store_id, is_primary")
      .in("store_id", storeIds);

    if (assignmentError) {
      return NextResponse.json({ error: assignmentError.message }, { status: 500 });
    }

    const assignedUserIds = Array.from(new Set((assignmentRows ?? []).map((row) => row.user_id)));

    if (assignedUserIds.length === 0) {
      const empty: EmployeeRosterData = {
        byStore: stores.map((store) => ({ storeId: store.id, storeName: store.label, employees: [] })),
        uniqueEmployeeCount: 0,
      };
      return NextResponse.json({ data: empty });
    }

    const { data: userRows, error: usersError } = await supabase
      .from("users")
      .select("id, full_name, status")
      .in("id", assignedUserIds)
      .eq("role", "employee")
      .order("full_name");

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    const employeesList = userRows ?? [];
    const employeeIdSet = new Set(employeesList.map((row) => row.id));

    const { data: profileRows, error: profileError } = await supabase
      .from("employee_profiles")
      .select("user_id, employee_code")
      .in("user_id", [...employeeIdSet]);

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const codeByUser = new Map((profileRows ?? []).map((row) => [row.user_id, row.employee_code]));

    const userById = new Map(employeesList.map((row) => [row.id, row]));

    const byStore: EmployeeRosterStoreGroup[] = stores.map((store) => {
      const links = (assignmentRows ?? []).filter(
        (row) => row.store_id === store.id && employeeIdSet.has(row.user_id),
      );

      const rosterEmployees: RosterEmployee[] = links
        .map((link) => {
          const user = userById.get(link.user_id);
          if (!user) {
            return null;
          }
          return {
            id: user.id,
            fullName: user.full_name,
            employeeCode: codeByUser.get(user.id) ?? null,
            status: user.status,
            isPrimaryForStore: link.is_primary,
          };
        })
        .filter((row): row is RosterEmployee => row !== null)
        .sort((a, b) => a.fullName.localeCompare(b.fullName));

      return {
        storeId: store.id,
        storeName: store.label,
        employees: rosterEmployees,
      };
    });

    const uniqueEmployeeCount = new Set(byStore.flatMap((group) => group.employees.map((employee) => employee.id)))
      .size;

    const payload: EmployeeRosterData = { byStore, uniqueEmployeeCount };

    return NextResponse.json({ data: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const access = await resolveApiDataAccess();
    if (access.kind === "unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (access.kind === "mock") {
      return NextResponse.json(
        {
          error:
            "Creating employees isn’t available in demo mode. Use a live workspace or ask your administrator to enable it.",
        },
        { status: 503 },
      );
    }

    const { supabase, userId } = access;

    const { data: roleRow, error: roleError } = await supabase.from("users").select("role").eq("id", userId).single();
    if (roleError || !roleRow || roleRow.role !== "admin") {
      return NextResponse.json({ error: "Only administrators can create employees." }, { status: 403 });
    }

    const service = tryCreateServiceRoleClient();
    if (!service) {
      return NextResponse.json(
        {
          error:
            "This workspace isn’t set up to create new sign-ins yet. An administrator must finish server configuration.",
        },
        { status: 503 },
      );
    }

    const input = createEmployeeBody.parse(await request.json());

    const primary = input.primaryStoreId ?? input.storeIds[0]!;
    if (!input.storeIds.includes(primary)) {
      return NextResponse.json({ error: "primaryStoreId must be one of storeIds" }, { status: 400 });
    }

    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Failed to create auth user" }, { status: 400 });
    }

    const newId = authData.user.id;

    try {
      const { error: userInsertError } = await service.from("users").insert({
        id: newId,
        full_name: input.fullName,
        role: "employee",
        status: "active",
      });
      if (userInsertError) {
        throw new Error(userInsertError.message);
      }

      const assignmentRows = input.storeIds.map((storeId) => ({
        user_id: newId,
        store_id: storeId,
        is_primary: storeId === primary,
      }));

      const { error: assignError } = await service.from("user_store_assignments").insert(assignmentRows);
      if (assignError) {
        throw new Error(assignError.message);
      }

      const { error: profileError } = await service.from("employee_profiles").insert({
        user_id: newId,
        employee_code: input.employeeCode,
        overtime_eligible: true,
      });
      if (profileError) {
        throw new Error(profileError.message);
      }
    } catch (setupError) {
      await service.auth.admin.deleteUser(newId);
      const msg = setupError instanceof Error ? setupError.message : "Setup failed";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({
      data: { userId: newId, email: input.email, fullName: input.fullName, employeeCode: input.employeeCode },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid body" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
