import type { TimesheetRow } from "@/lib/types/domain";

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function timesheetsToCsv(rows: TimesheetRow[]): string {
  const headers = [
    "employee_name",
    "employee_code",
    "store",
    "clock_in",
    "clock_out",
    "regular_hours",
    "ot_hours",
    "dt_hours",
    "status",
    "payroll_approved_at",
    "payroll_approved_by",
  ];

  const lines = [headers.join(",")];

  for (const row of rows) {
    const cells = [
      row.employeeName,
      row.employeeCode,
      row.storeName,
      row.clockInAt,
      row.clockOutAt,
      String(row.regularHours),
      String(row.otHours),
      String(row.dtHours),
      row.status,
      row.payrollApprovedAt ?? "",
      row.payrollApprovedByName ?? "",
    ];
    lines.push(cells.map(escapeCell).join(","));
  }

  return lines.join("\r\n");
}
