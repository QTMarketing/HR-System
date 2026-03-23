import { AddEmployeeForm } from "@/components/dashboard/add-employee-form";
import { EmployeesRosterView } from "@/components/dashboard/employees-roster-view";

export default function EmployeesPage() {
  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm text-[var(--text-secondary)]">
        See who is assigned to each location. Search by name, employee code, or store. Administrators can add new people
        at the bottom of this page.
      </p>

      <EmployeesRosterView />

      <section className="space-y-4 border-t border-[var(--border)] pt-8">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Add a new employee</h2>
        <AddEmployeeForm />
      </section>
    </div>
  );
}
