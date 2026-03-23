import { NextResponse } from "next/server";

import { allowsDashboardWithoutAuth } from "@/lib/auth-gate";
import { isMockMode } from "@/lib/data-mode";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!isMockMode()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  const nextPath = allowsDashboardWithoutAuth() ? "/overview" : "/login";
  const redirectUrl = new URL(nextPath, request.url);
  return NextResponse.redirect(redirectUrl);
}
