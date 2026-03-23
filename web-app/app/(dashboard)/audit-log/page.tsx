import { AuditLogView } from "@/components/dashboard/audit-log-view";

export default function AuditLogPage() {
  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
        Read-only history of sensitive time and configuration actions. Filter by date or keyword to investigate changes.
      </p>
      <AuditLogView />
    </div>
  );
}
