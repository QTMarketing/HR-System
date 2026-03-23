/**
 * Top bar title + subtitle for the current pathname (longest matching prefix wins).
 */
export function getDashboardHeader(pathname: string): { title: string; subtitle: string } {
  const normalized =
    pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;

  const entries: { prefix: string; title: string; subtitle: string }[] = [
    {
      prefix: "/reports/hour-mix",
      title: "Hour mix report",
      subtitle: "Regular, OT, and DT breakdown for active shifts.",
    },
    {
      prefix: "/reports/labor-by-store",
      title: "Labor by store",
      subtitle: "Estimated labor cost and share by location.",
    },
    {
      prefix: "/reports",
      title: "Reports",
      subtitle: "Payroll-focused summaries and drill-downs.",
    },
    {
      prefix: "/settings",
      title: "Settings",
      subtitle: "Workspace preferences and integrations.",
    },
    {
      prefix: "/audit-log",
      title: "Audit log",
      subtitle: "Immutable history of sensitive actions.",
    },
    {
      prefix: "/timesheets",
      title: "Timesheets",
      subtitle: "Review and approve time by period and store.",
    },
    {
      prefix: "/employees",
      title: "Employees",
      subtitle: "Directory, roles, and store assignments.",
    },
    {
      prefix: "/time-clock",
      title: "Time clock",
      subtitle: "Clock in, breaks, and clock out by store.",
    },
    {
      prefix: "/overview",
      title: "Overview",
      subtitle: "Multi-store labor visibility and approvals in one place.",
    },
  ];

  const sorted = [...entries].sort((a, b) => b.prefix.length - a.prefix.length);
  for (const entry of sorted) {
    if (normalized === entry.prefix || normalized.startsWith(`${entry.prefix}/`)) {
      return { title: entry.title, subtitle: entry.subtitle };
    }
  }

  if (normalized === "/" || normalized === "") {
    return {
      title: "Overview",
      subtitle: "Multi-store labor visibility and approvals in one place.",
    };
  }

  return {
    title: "HR System",
    subtitle: "Time, people, and approvals.",
  };
}
