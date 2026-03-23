"use client";

import { usePathname } from "next/navigation";

import { getDashboardHeader } from "@/lib/dashboard-header";

export function Topbar() {
  const pathname = usePathname() ?? "/overview";
  const { title, subtitle } = getDashboardHeader(pathname);

  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-8 py-4">
      <div className="min-w-0 pr-4">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h1>
        <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>
      </div>
    </header>
  );
}
