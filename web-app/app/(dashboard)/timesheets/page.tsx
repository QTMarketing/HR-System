import { TimesheetsView } from "@/components/dashboard/timesheets-view";

export default function TimesheetsPage() {
  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
        Completed shifts only (after clock out). Rows respect your store access. Filter by date and location, export to
        CSV, or mark payroll approval when your workflow uses it.
      </p>
      <TimesheetsView />
    </div>
  );
}
