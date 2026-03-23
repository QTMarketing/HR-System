import { redirect } from "next/navigation";

import { allowsDashboardWithoutAuth } from "@/lib/auth-gate";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Page() {
  if (allowsDashboardWithoutAuth()) {
    redirect("/overview");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  redirect(user ? "/overview" : "/login");
}
