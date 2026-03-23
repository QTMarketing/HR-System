"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchDashboardKpis } from "@/lib/api/time-entries";
import { queryKeys } from "@/lib/query-keys";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCards() {
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: queryKeys.dashboardKpis,
    queryFn: fetchDashboardKpis,
  });

  const kpis = data ?? [];

  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-28 animate-pulse bg-[var(--surface-soft)]" />
        ))}
      </section>
    );
  }

  if (isError) {
    return (
      <Card className="p-4">
        <p className="text-sm text-[var(--danger)]">KPI metrics failed to load.</p>
        <Button type="button" variant="outline" className="mt-3 h-9 text-xs" onClick={() => refetch()}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <section
      className={cn(
        "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
        isFetching && !isLoading && "opacity-[0.92] transition-opacity",
      )}
      aria-busy={isFetching && !isLoading}
    >
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-secondary)]">{kpi.label}</p>
            <Badge tone={kpi.tone}>{kpi.change}</Badge>
          </div>
          <p className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{kpi.value}</p>
        </Card>
      ))}
    </section>
  );
}
