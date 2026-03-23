-- Payroll review flags on closed shifts (timesheet approvals).
alter table public.time_entries
  add column if not exists payroll_approved_at timestamptz,
  add column if not exists payroll_approved_by uuid references public.users (id);

create index if not exists idx_time_entries_payroll_approved
  on public.time_entries (payroll_approved_at)
  where payroll_approved_at is not null;
