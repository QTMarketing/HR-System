# Phase D — Time clock (live UI)

Phase D replaces the **Time clock** stub with a real page that uses existing backend routes:

- `GET /api/time-entry-options` — employees & stores the current user may act on (RLS + role rules in API mode).
- `GET /api/time-entries` — open shifts (same payload as the Overview grid).
- `POST /api/clock-events` — applies `clock_in`, `clock_out`, `break_start`, `break_end` (mock store or Supabase `apply_clock_event` RPC).

## Prerequisites

- **Phase C** is optional for local dev: with `DATA_MODE=mock` or without `REQUIRE_SUPABASE_AUTH`, you can exercise the UI without signing in.
- For **real Postgres**: `DATA_MODE=api`, `REQUIRE_SUPABASE_AUTH=true`, seeded user (`docs/phase-c.md`), and migrations applied so `apply_clock_event` and `active_time_entries_view` exist.

## What to verify

1. Open **`/time-clock`** — you should see **Open shifts** (table) and **Record event** (employee, store, actions).
2. Select an employee **without** an open shift — **Clock in** enables when a store is selected; break / clock out stay disabled.
3. After **Clock in**, the row appears in the table; **Break start** / **Clock out** follow your shift state (matches mock rules in `lib/mock/time-tracking-store.ts`).
4. **Overview** KPIs / activity feed / hour mix update after events (shared React Query keys).
5. In **API mode** with auth, confirm actions respect RLS; a non-admin should only see stores/employees in scope.

## Store scope & roster

- **`GET /api/employees`** — employees with role `employee`, grouped by `user_store_assignments` for each store in the viewer’s scope (same store rules as time-entry options). Used by **`/employees`** and the time clock employee picker (`<optgroup>` by store).
- **`lib/viewer-store-scope.ts`** — shared “which stores can this user see?” logic for `time-entry-options` and `employees` routes.

## Related files

- `app/(dashboard)/time-clock/page.tsx` — route shell
- `components/dashboard/time-clock-panel.tsx` — UI + mutations
- `app/(dashboard)/employees/page.tsx` — directory by location first, then admin add-employee form
- `components/dashboard/time-entry-dialog.tsx` — same clock API from Overview
- `app/api/clock-events/route.ts`, `app/api/time-entries/route.ts`, `app/api/time-entry-options/route.ts`, `app/api/employees/route.ts`

## Later (Phase D+)

- Employee self-service kiosk (single identity, no employee picker).
- Manager defaults (remember last store, barcode / employee code entry).
- Real-time subscriptions for floor counts.
