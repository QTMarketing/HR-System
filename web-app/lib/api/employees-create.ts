export type CreateEmployeeInput = {
  email: string;
  password: string;
  fullName: string;
  employeeCode: string;
  storeIds: string[];
  primaryStoreId?: string;
};

type CreateEmployeeResponse = {
  data: { userId: string; email: string; fullName: string; employeeCode: string };
};

export async function createEmployeeViaApi(input: CreateEmployeeInput): Promise<CreateEmployeeResponse["data"]> {
  const response = await fetch("/api/employees", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to create employee");
  }
  const payload = (await response.json()) as CreateEmployeeResponse;
  return payload.data;
}
