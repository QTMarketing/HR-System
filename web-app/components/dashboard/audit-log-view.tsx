"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchAuditLog, type AuditLogFilters } from "@/lib/api/audit-log";
import { queryKeys } from "@/lib/query-keys";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function formatDt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - 30);
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function AuditLogView() {
  const initial = useMemo(() => defaultRange(), []);
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [entityName, setEntityName] = useState("");
  const [action, setAction] = useState("");

  const filters: AuditLogFilters = useMemo(
    () => ({
      from: from || undefined,
      to: to || undefined,
      entityName: entityName.trim() || undefined,
      action: action.trim() || undefined,
    }),
    [from, to, entityName, action],
  );

  const { data: rows = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.auditLog(filters),
    queryFn: () => fetchAuditLog(filters),
    retry: false,
  });

  const forbidden = isError && error instanceof Error && error.message.includes("only to admin");

  return (
    <div className="space-y-5">
      <Card className="border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-secondary)] shadow-[0_12px_32px_rgba(34,22,42,0.06)]">
        <p>
          Entries are created when people use the time clock or when administrators adjust time.{" "}
          <span className="font-medium text-[var(--text-primary)]">Administrators</span> and{" "}
          <span className="font-medium text-[var(--text-primary)]">compliance roles</span> can review this list; other
          roles may see an access message instead of data.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-[var(--text-muted)]" htmlFor="al-from">
              From
            </label>
            <Input id="al-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} disabled={forbidden} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-[var(--text-muted)]" htmlFor="al-to">
              To
            </label>
            <Input id="al-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} disabled={forbidden} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-[var(--text-muted)]" htmlFor="al-entity">
              Entity contains
            </label>
            <Input
              id="al-entity"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="Record or table name"
              disabled={forbidden}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-[var(--text-muted)]" htmlFor="al-action">
              Action contains
            </label>
            <Input
              id="al-action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g. clock in, update"
              disabled={forbidden}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-9 px-3 text-xs"
            onClick={() => refetch()}
            disabled={isFetching || forbidden}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
          <p className="text-xs text-[var(--text-muted)]">
            Change dates or filters, then press Refresh to load matching rows.
          </p>
        </div>
      </Card>

      {isError && !forbidden ? (
        <Card className="border-[var(--border)] p-6 text-sm text-[var(--danger)]">
          <p>{error instanceof Error ? error.message : "Failed to load audit log."}</p>
          <Button type="button" variant="outline" className="mt-3 h-9 text-xs" onClick={() => refetch()}>
            Try again
          </Button>
        </Card>
      ) : forbidden ? (
        <Card className="border-[var(--border)] p-6 text-sm text-[var(--text-secondary)]">
          {error instanceof Error ? error.message : "Access denied."}
        </Card>
      ) : (
        <Card className="overflow-hidden border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_32px_rgba(34,22,42,0.06)]">
          <div className="max-h-[min(560px,65vh)] overflow-auto">
            {isLoading ? (
              <div className="p-10 text-center text-sm text-[var(--text-muted)]">Loading audit log…</div>
            ) : rows.length === 0 ? (
              <div className="p-10 text-center text-sm text-[var(--text-secondary)]">
                No rows for these filters. Try widening the date range or clearing entity/action search.
              </div>
            ) : (
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="sticky top-0 z-[1] bg-[var(--surface-soft)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
                  <tr>
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 font-medium">Actor</th>
                    <th className="px-3 py-2 font-medium">Entity</th>
                    <th className="px-3 py-2 font-medium">Action</th>
                    <th className="px-3 py-2 font-medium">Reason</th>
                    <th className="px-3 py-2 font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-3 py-2.5 text-[var(--text-secondary)]">
                        {formatDt(row.createdAt)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-[var(--text-primary)]">{row.actorName}</div>
                        <div className="font-mono text-[10px] text-[var(--text-muted)]">{row.actorUserId.slice(0, 8)}…</div>
                      </td>
                      <td className="px-3 py-2.5 text-[var(--text-secondary)]">
                        <span className="font-medium">{row.entityName}</span>
                        {row.entityId ? (
                          <div className="font-mono text-[10px] text-[var(--text-muted)]">{row.entityId.slice(0, 8)}…</div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[var(--text-primary)]">{row.action}</td>
                      <td className="px-3 py-2.5 text-xs text-[var(--text-muted)]">{row.reasonCode ?? "—"}</td>
                      <td className="max-w-[240px] px-3 py-2.5 text-xs text-[var(--text-secondary)]">{row.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
