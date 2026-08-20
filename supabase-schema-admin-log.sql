-- ============================================================
-- SwapYard, admin action log
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================
-- Why: no record currently exists of admin actions (password
-- resets, account removals, access grants). Only useful if it
-- starts now, a log built later has no history before that point.

create table admin_action_log (
  id uuid default uuid_generate_v4() primary key,
  admin_id uuid references profiles(id),
  action text not null,
  target_outlet_id uuid references profiles(id),
  detail text,
  created_at timestamptz default now()
);

alter table admin_action_log enable row level security;

create policy "Only admins can view the action log"
  on admin_action_log for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Inserts happen via the service role client from admin actions,
-- which bypasses RLS, no insert policy needed for regular users.
