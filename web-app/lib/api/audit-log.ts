import type { AuditLogRow } from "@/lib/types/domain";

type AuditLogResponse = {
  data: AuditLogRow[];
};

export type AuditLogFilters = {
  from?: string;
  to?: string;
  entityName?: string;
  action?: string;
};

export async function fetchAuditLog(filters: AuditLogFilters = {}): Promise<AuditLogRow[]> {
  const params = new URLSearchParams();
  if (filters.from) {
    params.set("from", filters.from);
  }
  if (filters.to) {
    params.set("to", filters.to);
  }
  if (filters.entityName) {
    params.set("entityName", filters.entityName);
  }
  if (filters.action) {
    params.set("action", filters.action);
  }
  const qs = params.toString();
  const response = await fetch(`/api/audit-log${qs ? `?${qs}` : ""}`, { cache: "no-store" });
  if (response.status === 403) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Not allowed to view audit log");
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to load audit log");
  }
  const payload = (await response.json()) as AuditLogResponse;
  return payload.data;
}
