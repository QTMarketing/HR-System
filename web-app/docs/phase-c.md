# Phase C — Real Supabase session + seed data

Use this when you want the dashboard APIs to read/write **Postgres** under **RLS**, not in-memory mock.

## 1. Environment

- `DATA_MODE=api`
- **`REQUIRE_SUPABASE_AUTH=true`** — turns on the login wall and strict API behavior without a session.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in `.env.local`
- **`ALLOW_UNAUTHENTICATED_DEV`** — remove it or set to `false` so unauthenticated requests get **401** and you must sign in.

## 2. Auth URL settings

In Supabase → **Authentication** → **URL configuration**:

- **Site URL:** `http://localhost:3000` (or your dev URL)
- **Redirect URLs:** include `http://localhost:3000/**`

## 3. Create the first user

1. **Authentication** → **Users** → **Add user** (email + password).  
2. Copy the user’s **UUID** from the list (or from `auth.users` in SQL).

## 4. Run the seed

1. Open `supabase/seed-dev.sql` in this repo.  
2. Replace `PASTE_AUTH_USER_UUID` (all occurrences) with that UUID.  
3. Run the script in **SQL Editor**.

This creates/updates:

- `public.users` row (role `admin`)
- `public.stores` — `Downtown HQ`
- `user_store_assignments` — links admin to that store
- `employee_profiles` — optional `DEV-001` code

## 5. Sign in

1. Restart `npm run dev` if you changed `.env.local`.  
2. Visit `/` → you should be redirected to **`/login`**.  
3. Sign in with the email/password from **§3** (the Auth user you created).  
4. Open **Overview** — with live data, KPI badges reflect **real metrics** (e.g. **“Today’s hours”** on the totals card, not **“Demo data”**). Zeros are normal until you have `time_entries` rows.

## 6. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Redirect loop or always `/login` | Session cookies; check Site URL / same origin / HTTPS. |
| 401 on `/api/*` | `REQUIRE_SUPABASE_AUTH=true` with no session and `ALLOW_UNAUTHENTICATED_DEV` not true — sign in. If you are signed in, check cookies / Site URL. |
| Empty KPIs / no rows | No `time_entries` yet — expected until you clock in or insert test data. |
| “Unable to resolve user role” on options API | Missing `public.users` row for this auth user — re-run seed. |

## Related code

- `lib/auth-gate.ts` — `allowsDashboardWithoutAuth()`
- `lib/api-data-access.ts` — mock vs Supabase vs 401
- `app/login/page.tsx` — sign-in UI when auth is required
