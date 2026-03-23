# Phase F — Operations extras

Built incrementally on Phase E:

## 1. Timesheets — pay periods & CSV

- **Presets:** This week, last week, this month, last month, last 14 days (`lib/pay-period.ts`).
- **CSV:** Client-side export of the current grid (`lib/csv.ts`).

## 2. Payroll approval (closed shifts)

- Migration: `supabase/migrations/20260323120000_payroll_approval_columns.sql` adds `payroll_approved_at` and `payroll_approved_by` on `time_entries`.
- **POST `/api/payroll-approval`** — body `{ "timeEntryIds": ["uuid", ...], "approved": true|false }`. Allowed for **admin**, **sub_admin**, **store_manager** (RLS still applies per row).
- Mock mode updates in-memory state (`setMockPayrollApproval`).

## 3. Audit log filters

- **GET `/api/audit-log?from=&to=&entityName=&action=`** — date filters on server; entity/action substring match (after fetch cap).

## 4. Policy config editing

- **PATCH `/api/policy-configs/[id]`** — numeric thresholds + `roundingMode`. **Admin only** in API mode; mock mode updates in-memory policy (`patchMockPolicyConfig`).
- Settings page shows **Save** when session role is `admin` (`GET /api/session`).

## 5. Create employee (admin + service role)

- **POST `/api/employees`** — creates **Auth user** + `public.users` + `user_store_assignments` + `employee_profiles`.
- Requires:
  - `DATA_MODE=api`
  - Signed-in **admin**
  - **`SUPABASE_SERVICE_ROLE_KEY`** in server env (never expose to the client).
- Mock mode returns **503** with guidance.

## Env

Add to `.env.local` (server-only):

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
```

## Related files

- `app/api/session/route.ts`, `app/api/payroll-approval/route.ts`, `app/api/policy-configs/[id]/route.ts`
- `components/dashboard/timesheets-view.tsx`, `audit-log-view.tsx`, `settings-view.tsx`, `add-employee-form.tsx`
- `lib/supabase/service.ts`
