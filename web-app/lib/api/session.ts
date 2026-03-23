import type { SessionInfo } from "@/lib/types/domain";

type SessionResponse = {
  data: SessionInfo;
};

export async function fetchSession(): Promise<SessionInfo> {
  const response = await fetch("/api/session", { cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to load session");
  }
  const payload = (await response.json()) as SessionResponse;
  return payload.data;
}
