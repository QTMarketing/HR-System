import type { AppEnvironmentInfo, PolicyConfigRow } from "@/lib/types/domain";

export type PolicyConfigPatchBody = Partial<{
  overtimeDailyThreshold: number;
  doubleTimeDailyThreshold: number;
  overtimeWeeklyThreshold: number;
  autoClockOutHours: number;
  roundingMode: string;
}>;

type EnvResponse = {
  data: AppEnvironmentInfo;
};

type PolicyResponse = {
  data: PolicyConfigRow[];
};

export async function fetchAppEnvironment(): Promise<AppEnvironmentInfo> {
  const response = await fetch("/api/app-environment", { cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to load environment info");
  }
  const payload = (await response.json()) as EnvResponse;
  return payload.data;
}

export async function fetchPolicyConfigs(): Promise<PolicyConfigRow[]> {
  const response = await fetch("/api/policy-configs", { cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to load policy configuration");
  }
  const payload = (await response.json()) as PolicyResponse;
  return payload.data;
}

type PolicyPatchResponse = {
  data: PolicyConfigRow;
};

export async function patchPolicyConfig(id: string, body: PolicyConfigPatchBody): Promise<PolicyConfigRow> {
  const response = await fetch(`/api/policy-configs/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errBody?.error ?? "Failed to update policy");
  }
  const payload = (await response.json()) as PolicyPatchResponse;
  return payload.data;
}
