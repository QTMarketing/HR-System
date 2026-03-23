import type { EmployeeRosterData } from "@/lib/types/domain";

type EmployeeRosterResponse = {
  data: EmployeeRosterData;
};

export async function fetchEmployeeRoster(): Promise<EmployeeRosterData> {
  const response = await fetch("/api/employees", { cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to load employee roster");
  }
  const payload = (await response.json()) as EmployeeRosterResponse;
  return payload.data;
}
