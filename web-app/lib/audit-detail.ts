import type { Json } from "@/lib/types/supabase";

/** Compact line for audit log UI from `audit_logs.new_value` JSON. */
export function auditDetailFromJson(newValue: Json | null): string {
  if (newValue === null || newValue === undefined) {
    return "—";
  }
  if (typeof newValue !== "object" || Array.isArray(newValue)) {
    return String(newValue).slice(0, 120);
  }
  const o = newValue as Record<string, unknown>;
  if (typeof o.note === "string" && o.note.trim()) {
    return o.note.trim().slice(0, 120);
  }
  const parts: string[] = [];
  if (typeof o.method === "string") {
    parts.push(`method: ${o.method}`);
  }
  if (typeof o.store_id === "string") {
    parts.push(`store: ${(o.store_id as string).slice(0, 8)}…`);
  }
  if (typeof o.employee_id === "string") {
    parts.push(`employee: ${(o.employee_id as string).slice(0, 8)}…`);
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}
