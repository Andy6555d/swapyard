-- ============================================================
-- SwapYard, buying group verification
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================
-- Why: buying_group is self-reported and freely editable at any
-- time via the Account page. Without this, an outlet could set
-- their group to anything and instantly see that group's private
-- listings. This adds an admin approval step before a claimed
-- group actually grants group-only access, in either direction.

alter table profiles add column buying_group_verified boolean default false;

-- Update the matching function to require BOTH the viewer and the
-- target to be verified in the same group, not just claiming it.
create or replace function public.same_buying_group(target_outlet_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles viewer, profiles target
    where viewer.id = auth.uid()
      and target.id = target_outlet_id
      and viewer.buying_group is not null
      and viewer.buying_group_verified = true
      and target.buying_group_verified = true
      and viewer.buying_group = target.buying_group
  );
$$;
