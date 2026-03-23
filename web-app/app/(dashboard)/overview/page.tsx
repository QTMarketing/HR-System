"use client";

import dynamic from "next/dynamic";

import { KpiCards } from "@/components/dashboard/kpi-cards";
import { TimeEntriesTable } from "@/components/dashboard/time-entries-table";
import { TimeEntryDialog } from "@/components/dashboard/time-entry-dialog";

const HoursCharts = dynamic(() => import("@/components/dashboard/hours-charts").then((mod) => mod.HoursCharts), {
  ssr: false,
  loading: () => <div className="h-60 animate-pulse rounded-2xl bg-[var(--surface-soft)]" />,
});

const ActivityFeed = dynamic(() => import("@/components/dashboard/activity-feed").then((mod) => mod.ActivityFeed), {
  ssr: false,
  loading: () => <div className="h-[300px] animate-pulse rounded-2xl bg-[var(--surface-soft)]" />,
});

const HourMixPie = dynamic(
  () => import("@/components/dashboard/hour-mix-pie").then((mod) => mod.HourMixPie),
  {
    ssr: false,
    loading: () => <div className="h-[300px] animate-pulse rounded-2xl bg-[var(--surface-soft)]" />,
  },
);

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Operational snapshot
          </p>
          <p className="mt-1 max-w-xl text-sm text-[var(--text-secondary)]">
            Exceptions, open shifts, and hours — then trends and activity below.
          </p>
        </div>
        <div className="shrink-0">
          <TimeEntryDialog />
        </div>
      </div>

      <KpiCards />

      <HoursCharts />

      <section className="grid gap-4 xl:grid-cols-2">
        <ActivityFeed className="h-[300px]" />
        <HourMixPie className="h-[300px]" />
      </section>

      <TimeEntriesTable />
    </div>
  );
}
