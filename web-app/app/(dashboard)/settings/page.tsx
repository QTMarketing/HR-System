import { SettingsView } from "@/components/dashboard/settings-view";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
        Workspace connection details (read-only) and overtime / rounding rules by location. Only administrators can edit
        policies where your deployment allows it.
      </p>
      <SettingsView />
    </div>
  );
}
