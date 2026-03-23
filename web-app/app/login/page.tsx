import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import { allowsDashboardWithoutAuth } from "@/lib/auth-gate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  if (allowsDashboardWithoutAuth()) {
    redirect("/overview");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/overview");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--board-bg)] px-4">
      <Card className="w-full max-w-md space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">HR System</p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Sign in</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Sign in with your work email and password. If you can&apos;t get in, ask your workspace administrator to
          confirm your account and permissions.
        </p>
        <LoginForm />
      </Card>
    </main>
  );
}
