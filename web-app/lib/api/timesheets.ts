import type { TimesheetRow } from "@/lib/types/domain";

type TimesheetsResponse = {
  data: TimesheetRow[];
};

export type TimesheetFilters = {
  storeId?: string;
  from?: string;
  to?: string;
};

export async function fetchTimesheets(filters: TimesheetFilters = {}): Promise<TimesheetRow[]> {
  const params = new URLSearchParams();
  if (filters.storeId) {
    params.set("storeId", filters.storeId);
  }
  if (filters.from) {
    params.set("from", filters.from);
  }
  if (filters.to) {
    params.set("to", filters.to);
  }
  const qs = params.toString();
  const response = await fetch(`/api/timesheets${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to load timesheets");
  }
  const payload = (await response.json()) as TimesheetsResponse;
  return payload.data;
}
