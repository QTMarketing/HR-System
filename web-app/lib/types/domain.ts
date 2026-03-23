import type { DataMode } from "@/lib/data-mode";

export type AppRole = "admin" | "sub_admin" | "store_manager" | "employee";

export type TimeEventType = "clock_in" | "clock_out" | "break_start" | "break_end" | "admin_manual";

export type TimeEntryStatus = "clocked_in" | "on_break" | "clocked_out" | "flagged";

export type ActiveTimeEntry = {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  storeId: string;
  storeName: string;
  status: TimeEntryStatus;
  regularHours: number;
  otHours: number;
  dtHours: number;
};

export type CreateClockEventInput = {
  employeeId: string;
  storeId: string;
  action: Exclude<TimeEventType, "admin_manual">;
  notes?: string;
};

export type EntryOption = {
  id: string;
  label: string;
};

export type TimeEntryOptions = {
  employees: EntryOption[];
  stores: EntryOption[];
};

/** Employee row under a store for roster / time-clock grouping (from `user_store_assignments`). */
export type RosterEmployee = {
  id: string;
  fullName: string;
  employeeCode: string | null;
  status: "active" | "inactive" | "terminated";
  isPrimaryForStore: boolean;
};

export type EmployeeRosterStoreGroup = {
  storeId: string;
  storeName: string;
  employees: RosterEmployee[];
};

export type EmployeeRosterData = {
  byStore: EmployeeRosterStoreGroup[];
  /** Distinct employee user ids in scope (across all listed stores). */
  uniqueEmployeeCount: number;
};

/** Closed / submitted shifts (payroll-oriented grid). */
export type TimesheetRow = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  storeId: string;
  storeName: string;
  clockInAt: string;
  clockOutAt: string;
  status: TimeEntryStatus;
  regularHours: number;
  otHours: number;
  dtHours: number;
  payrollApprovedAt?: string | null;
  payrollApprovedByName?: string | null;
};

/** Signed-in viewer (for UI gating). Mock mode uses a synthetic admin when unauthenticated. */
export type SessionInfo = {
  userId: string | null;
  role: AppRole | null;
};

export type AuditLogRow = {
  id: string;
  createdAt: string;
  actorUserId: string;
  actorName: string;
  entityName: string;
  entityId: string | null;
  action: string;
  reasonCode: string | null;
  /** Short human-readable detail from payload. */
  detail: string;
};

/** Safe, non-secret deployment flags for the settings screen. */
export type AppEnvironmentInfo = {
  dataMode: DataMode;
  requireSupabaseAuth: boolean;
  allowUnauthenticatedDev: boolean;
};

export type PolicyConfigRow = {
  id: string;
  storeId: string | null;
  /** Display label; "Default (global)" when `storeId` is null. */
  storeName: string;
  overtimeDailyThreshold: number;
  doubleTimeDailyThreshold: number;
  overtimeWeeklyThreshold: number;
  autoClockOutHours: number;
  roundingMode: string;
};

export type DashboardKpiItem = {
  label: string;
  value: string;
  change: string;
  tone: "primary" | "warning" | "success" | "accent";
};

export type DashboardLinePoint = {
  day: string;
  hours: number;
  ot: number;
};

export type DashboardBarPoint = {
  store: string;
  laborCost: number;
  laborPct: number;
};

export type DashboardChartData = {
  lineData: DashboardLinePoint[];
  barData: DashboardBarPoint[];
};

export type HourMixSegment = {
  name: "Regular" | "OT" | "DT";
  value: number;
};

export type HourMixData = {
  totalHours: number;
  segments: HourMixSegment[];
};

/** Detailed hour-mix breakdown for reports (active / in-progress scope). */
export type HourMixReportEmployeeRow = {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  storeId: string;
  storeName: string;
  status: TimeEntryStatus;
  regularHours: number;
  otHours: number;
  dtHours: number;
  totalHours: number;
};

export type HourMixReportStoreRow = {
  storeId: string;
  storeName: string;
  regularHours: number;
  otHours: number;
  dtHours: number;
  totalHours: number;
  activeShiftCount: number;
};

export type HourMixReportData = {
  summary: HourMixData;
  generatedAt: string;
  scopeDescription: string;
  byEmployee: HourMixReportEmployeeRow[];
  byStore: HourMixReportStoreRow[];
};
