"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Clock3,
  FileSpreadsheet,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

const nav = [
  { label: "Overview", href: "/overview", icon: LayoutDashboard },
  { label: "Time Clock", href: "/time-clock", icon: Clock3 },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Timesheets", href: "/timesheets", icon: FileSpreadsheet },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Audit Log", href: "/audit-log", icon: ShieldCheck },
];

function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/overview") {
    return pathname === "/overview" || pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarProps = {
  /** When false, hide sign-out (no auth wall — see `lib/auth-gate.ts`). */
  showLogout?: boolean;
};

export function Sidebar({ showLogout = true }: SidebarProps) {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="sticky top-0 flex min-h-0 w-72 shrink-0 flex-col self-stretch overflow-hidden border-r border-[color-mix(in_oklab,var(--sidebar-ink)_16%,transparent)] bg-[var(--sidebar-bg)] px-4 py-6 text-[var(--text-on-dark)]">
      <div className="mb-7 px-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text-on-dark)_50%,transparent)]">
          HR System
        </p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight">Workspace</h1>
      </div>

      <nav className="space-y-1.5">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isRouteActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-[var(--sidebar-active-soft)] text-[var(--text-on-dark)] shadow-[inset_3px_0_0_0_var(--sidebar-indicator)]"
                  : "text-[color-mix(in_oklab,var(--text-on-dark)_72%,transparent)] hover:bg-[var(--sidebar-hover)]"
              }`}
            >
              <Icon size={16} strokeWidth={1.75} className="opacity-90" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-[color-mix(in_oklab,var(--sidebar-ink)_18%,transparent)] pt-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
            isRouteActive(pathname, "/settings")
              ? "bg-[var(--sidebar-active-soft)] text-[var(--text-on-dark)] shadow-[inset_3px_0_0_0_var(--sidebar-indicator)]"
              : "text-[color-mix(in_oklab,var(--text-on-dark)_72%,transparent)] hover:bg-[var(--sidebar-hover)]"
          }`}
        >
          <Settings size={16} strokeWidth={1.75} className="opacity-90" />
          Settings
        </Link>
        {showLogout ? (
          <form action="/api/auth/sign-out" method="post">
            <button
              type="submit"
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-[color-mix(in_oklab,var(--text-on-dark)_72%,transparent)] hover:bg-[var(--sidebar-hover)]"
            >
              Log out
            </button>
          </form>
        ) : null}
      </div>
    </aside>
  );
}
