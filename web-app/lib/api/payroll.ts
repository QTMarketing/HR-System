export type PayrollApprovalPayload = {
  timeEntryIds: string[];
  approved: boolean;
};

export async function submitPayrollApproval(payload: PayrollApprovalPayload): Promise<{ updated: number }> {
  const response = await fetch("/api/payroll-approval", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Payroll approval failed");
  }
  return (await response.json()) as { updated: number };
}
