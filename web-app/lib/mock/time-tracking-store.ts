import {
  ActiveTimeEntry,
  AuditLogRow,
  DashboardChartData,
  DashboardKpiItem,
  EmployeeRosterData,
  EntryOption,
  HourMixData,
  HourMixReportData,
  HourMixReportEmployeeRow,
  HourMixReportStoreRow,
  PolicyConfigRow,
  TimesheetRow,
} from "@/lib/types/domain";

export type PolicyConfigNumericPatch = Partial<
  Pick<
    PolicyConfigRow,
    | "overtimeDailyThreshold"
    | "doubleTimeDailyThreshold"
    | "overtimeWeeklyThreshold"
    | "autoClockOutHours"
    | "roundingMode"
  >
>;

export type AuditLogFilters = {
  from?: string;
  to?: string;
  entityName?: string;
  action?: string;
};

type EventAction = "clock_in" | "clock_out" | "break_start" | "break_end" | "admin_manual";

type InternalShift = {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  storeId: string;
  storeName: string;
  status: ActiveTimeEntry["status"];
  regularHours: number;
  otHours: number;
  dtHours: number;
  clockInAt: string;
  clockOutAt: string | null;
  hasOpenBreak: boolean;
};

type EventRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  storeId: string;
  storeName: string;
  action: EventAction;
  occurredAt: string;
  notes?: string;
};

const stores: EntryOption[] = [
  { id: "44444444-4444-4444-8444-444444444444", label: "Downtown" },
  { id: "55555555-5555-4555-8555-555555555555", label: "Northside" },
  { id: "66666666-6666-4666-8666-666666666666", label: "Lakeside" },
  { id: "77777777-7777-4777-8777-777777777777", label: "West End" },
];

const employees: EntryOption[] = [
  { id: "11111111-1111-4111-8111-111111111111", label: "Rose Smith" },
  { id: "22222222-2222-4222-8222-222222222222", label: "Robert Fox" },
  { id: "33333333-3333-4333-8333-333333333333", label: "Theresa Webb" },
  { id: "88888888-8888-4888-8888-888888888888", label: "Ronald Richards" },
  { id: "99999999-9999-4999-8999-999999999999", label: "Helen Ho" },
];

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
const daysAgo = (d: number, hours = 9) =>
  new Date(now.getTime() - d * 86_400_000 - (now.getHours() - hours) * 3_600_000).toISOString();

const shifts: InternalShift[] = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    employeeId: employees[0]!.id,
    employeeCode: "EMP-1007",
    employeeName: employees[0]!.label,
    storeId: stores[0]!.id,
    storeName: stores[0]!.label,
    status: "clocked_in",
    regularHours: 6.5,
    otHours: 0,
    dtHours: 0,
    clockInAt: minutesAgo(390),
    clockOutAt: null,
    hasOpenBreak: false,
  },
  {
    id: "a2222222-2222-4222-8222-222222222222",
    employeeId: employees[1]!.id,
    employeeCode: "EMP-1023",
    employeeName: employees[1]!.label,
    storeId: stores[2]!.id,
    storeName: stores[2]!.label,
    status: "flagged",
    regularHours: 7.2,
    otHours: 0.5,
    dtHours: 0,
    clockInAt: minutesAgo(470),
    clockOutAt: null,
    hasOpenBreak: false,
  },
  {
    id: "a3333333-3333-4333-8333-333333333333",
    employeeId: employees[2]!.id,
    employeeCode: "EMP-1040",
    employeeName: employees[2]!.label,
    storeId: stores[1]!.id,
    storeName: stores[1]!.label,
    status: "on_break",
    regularHours: 5.9,
    otHours: 0,
    dtHours: 0,
    clockInAt: minutesAgo(350),
    clockOutAt: null,
    hasOpenBreak: true,
  },
  {
    id: "a5555555-5555-4555-8555-555555555555",
    employeeId: employees[4]!.id,
    employeeCode: "EMP-1069",
    employeeName: employees[4]!.label,
    storeId: stores[3]!.id,
    storeName: stores[3]!.label,
    status: "clocked_in",
    regularHours: 4.1,
    otHours: 0,
    dtHours: 0,
    clockInAt: minutesAgo(245),
    clockOutAt: null,
    hasOpenBreak: false,
  },
];

const events: EventRecord[] = [
  {
    id: "e1111111-1111-4111-8111-111111111111",
    employeeId: employees[0]!.id,
    employeeName: employees[0]!.label,
    storeId: stores[0]!.id,
    storeName: stores[0]!.label,
    action: "clock_in",
    occurredAt: minutesAgo(18),
  },
  {
    id: "e2222222-2222-4222-8222-222222222222",
    employeeId: employees[1]!.id,
    employeeName: employees[1]!.label,
    storeId: stores[2]!.id,
    storeName: stores[2]!.label,
    action: "admin_manual",
    occurredAt: minutesAgo(43),
    notes: "Correction request reviewed",
  },
  {
    id: "e3333333-3333-4333-8333-333333333333",
    employeeId: employees[2]!.id,
    employeeName: employees[2]!.label,
    storeId: stores[1]!.id,
    storeName: stores[1]!.label,
    action: "break_start",
    occurredAt: minutesAgo(64),
  },
];

function nextId(prefix: "shift" | "event"): string {
  const rand = Math.random().toString(16).slice(2, 10);
  const base = `${Date.now()}`.slice(-8);
  return `${prefix}-${base}-${rand}`;
}

function formatEventLabel(action: EventAction): string {
  if (action === "clock_in") return "clocked in";
  if (action === "clock_out") return "clocked out";
  if (action === "break_start") return "started break";
  if (action === "break_end") return "ended break";
  return "added manual event";
}

function toActiveEntry(shift: InternalShift): ActiveTimeEntry {
  return {
    id: shift.id,
    employeeId: shift.employeeId,
    employeeCode: shift.employeeCode,
    employeeName: shift.employeeName,
    storeId: shift.storeId,
    storeName: shift.storeName,
    status: shift.status,
    regularHours: shift.regularHours,
    otHours: shift.otHours,
    dtHours: shift.dtHours,
  };
}

function findStoreLabel(storeId: string): string {
  return stores.find((store) => store.id === storeId)?.label ?? "Unknown Store";
}

function findEmployeeLabel(employeeId: string): string {
  return employees.find((employee) => employee.id === employeeId)?.label ?? "Unknown Employee";
}

function findEmployeeCode(employeeId: string): string {
  const found = shifts.find((shift) => shift.employeeId === employeeId)?.employeeCode;
  return found ?? `EMP-${employeeId.slice(0, 4).toUpperCase()}`;
}

/** Mock store ↔ employee links (primary = default home store for roster badges). */
const mockRosterAssignments: { storeIndex: number; employeeIndex: number; isPrimary: boolean }[] = [
  { storeIndex: 0, employeeIndex: 0, isPrimary: true },
  { storeIndex: 2, employeeIndex: 1, isPrimary: true },
  { storeIndex: 1, employeeIndex: 1, isPrimary: false },
  { storeIndex: 1, employeeIndex: 2, isPrimary: true },
  { storeIndex: 3, employeeIndex: 3, isPrimary: true },
  { storeIndex: 2, employeeIndex: 4, isPrimary: true },
];

export function getMockTimeEntryOptions() {
  return {
    employees,
    stores,
  };
}

export function getMockEmployeeRoster(): EmployeeRosterData {
  const byStore = stores.map((store, storeIndex) => {
    const links = mockRosterAssignments.filter((link) => link.storeIndex === storeIndex);
    const rosterEmployees = links
      .map((link) => {
        const emp = employees[link.employeeIndex]!;
        return {
          id: emp.id,
          fullName: emp.label,
          employeeCode: findEmployeeCode(emp.id),
          status: "active" as const,
          isPrimaryForStore: link.isPrimary,
        };
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    return {
      storeId: store.id,
      storeName: store.label,
      employees: rosterEmployees,
    };
  });

  const uniqueIds = new Set(mockRosterAssignments.map((link) => employees[link.employeeIndex]!.id));

  return {
    byStore,
    uniqueEmployeeCount: uniqueIds.size,
  };
}

export function getMockTimeEntries(): ActiveTimeEntry[] {
  return shifts.filter((shift) => shift.clockOutAt === null).map(toActiveEntry);
}

export function getMockActiveShifts(): ActiveTimeEntry[] {
  return shifts
    .filter((shift) => shift.clockOutAt === null && (shift.status === "clocked_in" || shift.status === "on_break"))
    .map(toActiveEntry);
}

export function getMockActivityFeed(): string[] {
  return events
    .slice()
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
    .slice(0, 12)
    .map((event) => {
      const localTime = new Date(event.occurredAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      return `${event.employeeName} ${formatEventLabel(event.action)} at ${event.storeName} (${localTime})`;
    });
}

export function getMockKpis(): DashboardKpiItem[] {
  const activeCount = getMockActiveShifts().length;
  const flaggedCount = shifts.filter((shift) => shift.status === "flagged" && shift.clockOutAt === null).length;
  const manualCount24h = events.filter((event) => event.action === "admin_manual").length;
  const totalHours = shifts
    .filter((shift) => shift.clockOutAt === null)
    .reduce((sum, shift) => sum + shift.regularHours + shift.otHours + shift.dtHours, 0);

  return [
    { label: "Currently Clocked In", value: String(activeCount), change: "Demo data", tone: "primary" },
    { label: "Pending Approvals", value: String(manualCount24h), change: "Demo data", tone: "warning" },
    { label: "Flagged Short Entries", value: String(flaggedCount), change: "Demo data", tone: "accent" },
    {
      label: "Total Hours Today",
      value: Intl.NumberFormat("en-US").format(Math.round(totalHours * 100) / 100),
      change: "Demo data",
      tone: "success",
    },
  ];
}

export function getMockDashboardCharts(): DashboardChartData {
  const lineData = [
    { day: "Mon", hours: 176, ot: 22 },
    { day: "Tue", hours: 181, ot: 24 },
    { day: "Wed", hours: 173, ot: 18 },
    { day: "Thu", hours: 189, ot: 27 },
    { day: "Fri", hours: 194, ot: 31 },
    { day: "Sat", hours: 157, ot: 14 },
    { day: "Sun", hours: 145, ot: 11 },
  ];

  const storeHours = new Map<string, { laborCost: number; laborPct: number }>();
  for (const shift of shifts) {
    const current = storeHours.get(shift.storeName) ?? { laborCost: 0, laborPct: 0 };
    const totalHours = shift.regularHours + shift.otHours * 1.5 + shift.dtHours * 2;
    const nextCost = current.laborCost + totalHours * 25;
    storeHours.set(shift.storeName, {
      laborCost: Math.round(nextCost),
      laborPct: Math.max(10, Math.min(40, Math.round((nextCost / 400) * 10))),
    });
  }

  const barData = Array.from(storeHours.entries()).map(([store, value]) => ({
    store,
    laborCost: value.laborCost,
    laborPct: value.laborPct,
  }));

  return { lineData, barData };
}

export function getMockHourMix(): HourMixData {
  const relevant = shifts.filter((shift) => shift.clockOutAt === null);
  const regular = relevant.reduce((sum, shift) => sum + shift.regularHours, 0);
  const ot = relevant.reduce((sum, shift) => sum + shift.otHours, 0);
  const dt = relevant.reduce((sum, shift) => sum + shift.dtHours, 0);

  const totalHours = regular + ot + dt;

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    segments: [
      { name: "Regular", value: Math.round(regular * 100) / 100 },
      { name: "OT", value: Math.round(ot * 100) / 100 },
      { name: "DT", value: Math.round(dt * 100) / 100 },
    ],
  };
}

export function getMockHourMixReport(): HourMixReportData {
  const summary = getMockHourMix();
  const active = shifts.filter((shift) => shift.clockOutAt === null);

  const byEmployee: HourMixReportEmployeeRow[] = active
    .map((shift) => ({
      employeeId: shift.employeeId,
      employeeCode: shift.employeeCode,
      employeeName: shift.employeeName,
      storeId: shift.storeId,
      storeName: shift.storeName,
      status: shift.status,
      regularHours: Math.round(shift.regularHours * 100) / 100,
      otHours: Math.round(shift.otHours * 100) / 100,
      dtHours: Math.round(shift.dtHours * 100) / 100,
      totalHours: Math.round((shift.regularHours + shift.otHours + shift.dtHours) * 100) / 100,
    }))
    .sort((a, b) => a.employeeName.localeCompare(b.employeeName));

  const storeMap = new Map<string, HourMixReportStoreRow>();
  for (const shift of active) {
    const existing = storeMap.get(shift.storeId) ?? {
      storeId: shift.storeId,
      storeName: shift.storeName,
      regularHours: 0,
      otHours: 0,
      dtHours: 0,
      totalHours: 0,
      activeShiftCount: 0,
    };
    existing.regularHours += shift.regularHours;
    existing.otHours += shift.otHours;
    existing.dtHours += shift.dtHours;
    existing.activeShiftCount += 1;
    storeMap.set(shift.storeId, existing);
  }

  const byStore = Array.from(storeMap.values())
    .map((row) => {
      const regularHours = Math.round(row.regularHours * 100) / 100;
      const otHours = Math.round(row.otHours * 100) / 100;
      const dtHours = Math.round(row.dtHours * 100) / 100;
      return {
        ...row,
        regularHours,
        otHours,
        dtHours,
        totalHours: Math.round((regularHours + otHours + dtHours) * 100) / 100,
      };
    })
    .sort((a, b) => b.totalHours - a.totalHours);

  return {
    summary,
    generatedAt: new Date().toISOString(),
    scopeDescription:
      "Totals reflect active shifts only (employees not yet clocked out). Use timesheets for finalized payroll hours.",
    byEmployee,
    byStore,
  };
}

export function applyMockClockEvent(input: {
  employeeId: string;
  storeId: string;
  action: "clock_in" | "clock_out" | "break_start" | "break_end";
  notes?: string;
}) {
  const occurredAt = new Date().toISOString();
  const existingActive = shifts.find((shift) => shift.employeeId === input.employeeId && shift.clockOutAt === null);

  if (input.action === "clock_in") {
    if (existingActive) {
      throw new Error("Cannot clock in while an active shift exists.");
    }

    shifts.unshift({
      id: nextId("shift"),
      employeeId: input.employeeId,
      employeeCode: findEmployeeCode(input.employeeId),
      employeeName: findEmployeeLabel(input.employeeId),
      storeId: input.storeId,
      storeName: findStoreLabel(input.storeId),
      status: "clocked_in",
      regularHours: 0,
      otHours: 0,
      dtHours: 0,
      clockInAt: occurredAt,
      clockOutAt: null,
      hasOpenBreak: false,
    });
  } else if (input.action === "clock_out") {
    if (!existingActive) {
      throw new Error("Cannot clock out without an active shift.");
    }
    existingActive.clockOutAt = occurredAt;
    existingActive.status = "clocked_out";
    existingActive.hasOpenBreak = false;
  } else if (input.action === "break_start") {
    if (!existingActive) {
      throw new Error("Cannot start break without an active shift.");
    }
    if (existingActive.hasOpenBreak) {
      throw new Error("An active break already exists for this shift.");
    }
    existingActive.status = "on_break";
    existingActive.hasOpenBreak = true;
  } else {
    if (!existingActive) {
      throw new Error("Cannot end break without an active shift.");
    }
    if (!existingActive.hasOpenBreak) {
      throw new Error("Cannot end break because no break is currently active.");
    }
    existingActive.status = "clocked_in";
    existingActive.hasOpenBreak = false;
  }

  const eventId = nextId("event");
  events.unshift({
    id: eventId,
    employeeId: input.employeeId,
    employeeName: findEmployeeLabel(input.employeeId),
    storeId: input.storeId,
    storeName: findStoreLabel(input.storeId),
    action: "admin_manual",
    occurredAt,
    notes: input.notes,
  });

  return { eventId };
}

const mockTimesheetRows: TimesheetRow[] = [
  {
    id: "ts-mock-001",
    employeeId: employees[3]!.id,
    employeeName: employees[3]!.label,
    employeeCode: "EMP-1088",
    storeId: stores[3]!.id,
    storeName: stores[3]!.label,
    clockInAt: daysAgo(1, 8),
    clockOutAt: daysAgo(1, 16),
    status: "clocked_out",
    regularHours: 7.5,
    otHours: 0,
    dtHours: 0,
  },
  {
    id: "ts-mock-002",
    employeeId: employees[0]!.id,
    employeeName: employees[0]!.label,
    employeeCode: "EMP-1007",
    storeId: stores[0]!.id,
    storeName: stores[0]!.label,
    clockInAt: daysAgo(2, 9),
    clockOutAt: daysAgo(2, 17),
    status: "clocked_out",
    regularHours: 7.25,
    otHours: 0.25,
    dtHours: 0,
  },
  {
    id: "ts-mock-003",
    employeeId: employees[1]!.id,
    employeeName: employees[1]!.label,
    employeeCode: "EMP-1023",
    storeId: stores[2]!.id,
    storeName: stores[2]!.label,
    clockInAt: daysAgo(3, 8),
    clockOutAt: daysAgo(3, 14),
    status: "flagged",
    regularHours: 5.75,
    otHours: 0,
    dtHours: 0,
  },
  {
    id: "ts-mock-004",
    employeeId: employees[2]!.id,
    employeeName: employees[2]!.label,
    employeeCode: "EMP-1040",
    storeId: stores[1]!.id,
    storeName: stores[1]!.label,
    clockInAt: daysAgo(5, 7),
    clockOutAt: daysAgo(5, 15),
    status: "clocked_out",
    regularHours: 7.5,
    otHours: 0,
    dtHours: 0,
  },
  {
    id: "ts-mock-005",
    employeeId: employees[4]!.id,
    employeeName: employees[4]!.label,
    employeeCode: "EMP-1069",
    storeId: stores[2]!.id,
    storeName: stores[2]!.label,
    clockInAt: daysAgo(6, 10),
    clockOutAt: daysAgo(6, 19),
    status: "clocked_out",
    regularHours: 8,
    otHours: 1,
    dtHours: 0,
  },
];

const mockPayrollByEntryId = new Map<string, { at: string; byName: string }>();
mockPayrollByEntryId.set("ts-mock-002", { at: daysAgo(1, 12), byName: "Dev Admin" });

const mockPolicyPatchesById = new Map<string, PolicyConfigNumericPatch>();

export function setMockPayrollApproval(entryId: string, approved: boolean, approverName: string) {
  if (approved) {
    mockPayrollByEntryId.set(entryId, { at: new Date().toISOString(), byName: approverName });
  } else {
    mockPayrollByEntryId.delete(entryId);
  }
}

export function patchMockPolicyConfig(id: string, patch: PolicyConfigNumericPatch) {
  mockPolicyPatchesById.set(id, { ...mockPolicyPatchesById.get(id), ...patch });
}

const mockAuditRows: AuditLogRow[] = [
  {
    id: "aud-mock-001",
    createdAt: minutesAgo(22),
    actorUserId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    actorName: "Dev Admin",
    entityName: "time_events",
    entityId: "e1111111-1111-4111-8111-111111111111",
    action: "clock_in",
    reasonCode: "MANUAL_ENTRY",
    detail: `${employees[0]!.label} · ${stores[0]!.label}`,
  },
  {
    id: "aud-mock-002",
    createdAt: minutesAgo(55),
    actorUserId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    actorName: "Dev Admin",
    entityName: "time_events",
    entityId: "e2222222-2222-4222-8222-222222222222",
    action: "break_start",
    reasonCode: "MANUAL_ENTRY",
    detail: `${employees[2]!.label} · ${stores[1]!.label}`,
  },
  {
    id: "aud-mock-003",
    createdAt: minutesAgo(120),
    actorUserId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    actorName: "Dev Admin",
    entityName: "time_events",
    entityId: "e3333333-3333-4333-8333-333333333333",
    action: "admin_manual",
    reasonCode: "MANUAL_ENTRY",
    detail: `${employees[1]!.label} · correction note applied`,
  },
  {
    id: "aud-mock-004",
    createdAt: daysAgo(9, 15),
    actorUserId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    actorName: "Dev Admin",
    entityName: "users",
    entityId: employees[2]!.id,
    action: "profile_update",
    reasonCode: null,
    detail: "Role review",
  },
  {
    id: "aud-mock-005",
    createdAt: daysAgo(2, 11),
    actorUserId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    actorName: "Dev Admin",
    entityName: "time_events",
    entityId: "e4444444-4444-4444-8444-444444444444",
    action: "clock_out",
    reasonCode: "MANUAL_ENTRY",
    detail: `${employees[4]!.label} · ${stores[2]!.label}`,
  },
];

export function getMockTimesheetRows(filters?: { storeId?: string; from?: string; to?: string }): TimesheetRow[] {
  let rows = [...mockTimesheetRows];
  if (filters?.storeId) {
    rows = rows.filter((row) => row.storeId === filters.storeId);
  }
  if (filters?.from) {
    const fromT = new Date(filters.from).getTime();
    rows = rows.filter((row) => new Date(row.clockInAt).getTime() >= fromT);
  }
  if (filters?.to) {
    const toT = new Date(filters.to).getTime() + 86_400_000;
    rows = rows.filter((row) => new Date(row.clockInAt).getTime() < toT);
  }
  const merged = rows.map((row) => {
    const p = mockPayrollByEntryId.get(row.id);
    return {
      ...row,
      payrollApprovedAt: p?.at ?? null,
      payrollApprovedByName: p?.byName ?? null,
    };
  });
  return merged.sort((a, b) => (a.clockInAt < b.clockInAt ? 1 : -1));
}

export function getMockAuditLog(filters?: AuditLogFilters): AuditLogRow[] {
  let rows = [...mockAuditRows];
  if (filters?.from) {
    const fromT = new Date(`${filters.from}T00:00:00.000Z`).getTime();
    rows = rows.filter((row) => new Date(row.createdAt).getTime() >= fromT);
  }
  if (filters?.to) {
    const end = new Date(`${filters.to}T00:00:00.000Z`);
    end.setUTCDate(end.getUTCDate() + 1);
    const toT = end.getTime();
    rows = rows.filter((row) => new Date(row.createdAt).getTime() < toT);
  }
  if (filters?.entityName?.trim()) {
    const q = filters.entityName.trim().toLowerCase();
    rows = rows.filter((row) => row.entityName.toLowerCase().includes(q));
  }
  if (filters?.action?.trim()) {
    const q = filters.action.trim().toLowerCase();
    rows = rows.filter((row) => row.action.toLowerCase().includes(q));
  }
  return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getMockPolicyConfigs(): PolicyConfigRow[] {
  return stores.map((store) => {
    const id = `pol-mock-${store.id.slice(0, 8)}`;
    const base: PolicyConfigRow = {
      id,
      storeId: store.id,
      storeName: store.label,
      overtimeDailyThreshold: 8,
      doubleTimeDailyThreshold: 12,
      overtimeWeeklyThreshold: 40,
      autoClockOutHours: 12,
      roundingMode: "none",
    };
    const patch = mockPolicyPatchesById.get(id);
    return patch ? { ...base, ...patch } : base;
  });
}
