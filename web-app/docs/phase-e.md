# Phase E — Timesheets, audit log, settings

Replaces the last dashboard stubs with operational screens. **Timesheets** and **audit log** are read-only grids (plus Phase F payroll actions on timesheets). **Settings** shows read-only workspace flags; **per-store policy** cards can be **saved in-app by admins** — see **Phase F** (`PATCH /api/policy-configs/[id]`).

## Routes

| Page | API | Notes |
|------|-----|--------|
| `/timesheets` | `GET /api/timesheets?storeId=&from=&to=` | **Closed** `time_entries` only (`clock_out_at` not null). RLS scopes rows by store. |
| `/audit-log` | `GET /api/audit-log` | **`admin`** and **`sub_admin` only** (403 for others). Rows from `audit_logs` (written inside `apply_clock_event`). |
| `/settings` | `GET /api/app-environment`, `GET /api/policy-configs`, `PATCH /api/policy-configs/[id]` (Phase F) | Safe env flags (no secrets). Policy cards from `policy_configs` (RLS). **Admin** can save threshold/rounding changes in API mode. |

## Mock mode

- Sample **closed shifts**, **audit rows**, and **per-store policy** cards ship from `lib/mock/time-tracking-store.ts`.

## Production checklist

- Ensure migrations applied; `audit_logs` fills as users record clock events in API mode.
- **Store managers** cannot read `audit_logs` by policy — they will see the permission message on `/audit-log`.
- **Policy editing:** admins use **Settings → Time rules by location → Save** in API mode, or SQL if you prefer. See **docs/phase-f.md**.

## Related files

- `components/dashboard/timesheets-view.tsx`, `audit-log-view.tsx`, `settings-view.tsx`
- `app/api/policy-configs/[id]/route.ts` — admin PATCH (Phase F)
- `lib/audit-detail.ts` — formats `new_value` JSON for the audit table
- `lib/viewer-store-scope.ts` — shared store list (also Phase D)
