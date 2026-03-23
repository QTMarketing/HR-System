-- =============================================================================
-- Dev seed: first Supabase Auth user → admin + default store (Phase C)
-- =============================================================================
-- 1. Supabase Dashboard → Authentication → Users → Add user (email + password).
-- 2. Copy the new user's UUID from the users table (auth.users id = public.users id).
-- 3. Replace BOTH occurrences of PASTE_AUTH_USER_UUID below with that UUID.
-- 4. Run this entire script in SQL Editor.
-- =============================================================================

insert into public.users (id, full_name, role, status)
values (
  'PASTE_AUTH_USER_UUID'::uuid,
  'Dev Admin',
  'admin',
  'active'
)
on conflict (id) do update
  set full_name = excluded.full_name,
      role = excluded.role,
      status = excluded.status;

insert into public.stores (name, timezone, is_active)
values ('Downtown HQ', 'America/New_York', true)
on conflict (name) do update
  set timezone = excluded.timezone,
      is_active = excluded.is_active;

insert into public.user_store_assignments (user_id, store_id, is_primary)
select 'PASTE_AUTH_USER_UUID'::uuid, s.id, true
from public.stores s
where s.name = 'Downtown HQ'
on conflict (user_id, store_id) do update
  set is_primary = excluded.is_primary;

-- Optional: employee code for time-entry UIs that join employee_profiles
insert into public.employee_profiles (user_id, employee_code, overtime_eligible)
values ('PASTE_AUTH_USER_UUID'::uuid, 'DEV-001', true)
on conflict (user_id) do update
  set employee_code = excluded.employee_code;
