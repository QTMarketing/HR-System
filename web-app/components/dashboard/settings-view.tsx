"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  fetchAppEnvironment,
  fetchPolicyConfigs,
  patchPolicyConfig,
  type PolicyConfigPatchBody,
} from "@/lib/api/app-settings";
import { fetchSession } from "@/lib/api/session";
import { queryKeys } from "@/lib/query-keys";
import type { PolicyConfigRow } from "@/lib/types/domain";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function PolicyEditorCard({ row, canEdit }: { row: PolicyConfigRow; canEdit: boolean }) {
  const queryClient = useQueryClient();
  const [otDaily, setOtDaily] = useState(String(row.overtimeDailyThreshold));
  const [dtDaily, setDtDaily] = useState(String(row.doubleTimeDailyThreshold));
  const [otWeek, setOtWeek] = useState(String(row.overtimeWeeklyThreshold));
  const [autoOut, setAutoOut] = useState(String(row.autoClockOutHours));
  const [rounding, setRounding] = useState(row.roundingMode);

  const mutation = useMutation({
    mutationFn: (body: PolicyConfigPatchBody) => patchPolicyConfig(row.id, body),
    onSuccess: async () => {
      toast.success("Policy updated");
      await queryClient.invalidateQueries({ queryKey: queryKeys.policyConfigs });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      overtimeDailyThreshold: Number(otDaily),
      doubleTimeDailyThreshold: Number(dtDaily),
      overtimeWeeklyThreshold: Number(otWeek),
      autoClockOutHours: Number(autoOut),
      roundingMode: rounding,
    };
    if (Object.values(body).some((v) => typeof v === "number" && Number.isNaN(v))) {
      toast.error("Enter valid numbers");
      return;
    }
    mutation.mutate(body);
  }

  return (
    <form
      onSubmit={onSave}
      className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-sm"
    >
      <h3 className="font-semibold text-[var(--text-primary)]">{row.storeName}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-[var(--text-secondary)]">
          <span className="text-xs">Daily OT after (h)</span>
          <Input value={otDaily} onChange={(e) => setOtDaily(e.target.value)} type="number" step="0.25" disabled={!canEdit} />
        </label>
        <label className="flex flex-col gap-1 text-[var(--text-secondary)]">
          <span className="text-xs">Daily DT after (h)</span>
          <Input value={dtDaily} onChange={(e) => setDtDaily(e.target.value)} type="number" step="0.25" disabled={!canEdit} />
        </label>
        <label className="flex flex-col gap-1 text-[var(--text-secondary)]">
          <span className="text-xs">Weekly OT after (h)</span>
          <Input value={otWeek} onChange={(e) => setOtWeek(e.target.value)} type="number" step="0.25" disabled={!canEdit} />
        </label>
        <label className="flex flex-col gap-1 text-[var(--text-secondary)]">
          <span className="text-xs">Auto clock-out (h)</span>
          <Input value={autoOut} onChange={(e) => setAutoOut(e.target.value)} type="number" step="1" disabled={!canEdit} />
        </label>
        <label className="col-span-full flex flex-col gap-1 text-[var(--text-secondary)]">
          <span className="text-xs">Rounding mode</span>
          <select
            value={rounding}
            onChange={(e) => setRounding(e.target.value)}
            disabled={!canEdit}
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
          >
            <option value="none">No rounding</option>
            <option value="nearest_5">Nearest 5 minutes</option>
            <option value="nearest_6">Nearest 6 minutes</option>
            <option value="nearest_15">Nearest 15 minutes</option>
          </select>
        </label>
      </div>
      {canEdit ? (
        <Button type="submit" className="mt-3" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save policy"}
        </Button>
      ) : (
        <p className="mt-3 text-xs text-[var(--text-muted)]">Only administrators can save changes in your live workspace.</p>
      )}
    </form>
  );
}

export function SettingsView() {
  const envQuery = useQuery({
    queryKey: queryKeys.appEnvironment,
    queryFn: fetchAppEnvironment,
  });

  const sessionQuery = useQuery({
    queryKey: queryKeys.session,
    queryFn: fetchSession,
  });

  const policyQuery = useQuery({
    queryKey: queryKeys.policyConfigs,
    queryFn: fetchPolicyConfigs,
  });

  const isAdmin = sessionQuery.data?.role === "admin";
  const canEditPolicies = isAdmin;

  return (
    <div className="space-y-5">
      <Card className="border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_12px_32px_rgba(34,22,42,0.06)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Workspace connection</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Read-only snapshot of how this app is running. Secrets are never shown here. After environment changes on the
          server, restart the app for values to update.
        </p>
        {envQuery.isError ? (
          <p className="mt-3 text-sm text-[var(--danger)]">
            {envQuery.error instanceof Error ? envQuery.error.message : "Failed to load."}
          </p>
        ) : envQuery.isLoading ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">Loading…</p>
        ) : (
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Data source</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                {envQuery.data?.dataMode === "api" ? "Live database" : "Demo / offline"}
                <span className="ml-2 font-mono text-xs text-[var(--text-muted)]">({envQuery.data?.dataMode})</span>
              </dd>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Sign-in required</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                {envQuery.data?.requireSupabaseAuth ? "Yes" : "No"}
              </dd>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Dev access without sign-in</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                {envQuery.data?.allowUnauthenticatedDev ? "Allowed (non-production only)" : "Not allowed"}
              </dd>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2">
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Your role</dt>
              <dd className="mt-1 text-sm font-medium capitalize text-[var(--text-primary)]">
                {sessionQuery.isLoading ? "…" : (sessionQuery.data?.role?.replace(/_/g, " ") ?? "—")}
              </dd>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Auth service URL</dt>
              <dd className="mt-1 text-sm text-[var(--text-muted)]">
                Configured on the server and not displayed in the browser.
              </dd>
            </div>
          </dl>
        )}
      </Card>

      <Card className="border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_12px_32px_rgba(34,22,42,0.06)]">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Time rules by location</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Overtime thresholds, auto clock-out, and rounding per store. <strong>Administrators</strong> can save when
          connected to a live database; in demo mode, changes apply only for this session.
        </p>
        {policyQuery.isError ? (
          <p className="mt-3 text-sm text-[var(--danger)]">
            {policyQuery.error instanceof Error ? policyQuery.error.message : "Failed to load policies."}
          </p>
        ) : policyQuery.isLoading ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">Loading…</p>
        ) : (policyQuery.data ?? []).length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            No policy rows returned. Your workspace may need initial setup from an administrator.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(policyQuery.data ?? []).map((row) => (
              <PolicyEditorCard
                key={`${row.id}-${row.overtimeDailyThreshold}-${row.roundingMode}`}
                row={row}
                canEdit={canEditPolicies}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
