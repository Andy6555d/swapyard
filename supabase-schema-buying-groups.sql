-- ============================================================
-- SwapYard, buying groups and listing/request visibility
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================

-- Which buying group (if any) an outlet belongs to
alter table profiles add column buying_group text;

-- Whether a listing/request is visible to everyone, or only to
-- outlets in the same buying group
alter table listings add column visibility text default 'all';
alter table listings add constraint listings_visibility_check check (visibility in ('all', 'group'));

alter table requests add column visibility text default 'all';
alter table requests add constraint requests_visibility_check check (visibility in ('all', 'group'));

-- Checks whether the currently logged-in user shares a buying group
-- with the given outlet. Returns false if either has no group set.
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
      and viewer.buying_group = target.buying_group
  );
$$;

-- Update listings visibility to respect group-only restriction
drop policy if exists "Listings viewable by paid members only" on listings;
create policy "Listings viewable respecting group visibility"
  on listings for select
  using (
    public.is_paid_member()
    and (
      visibility = 'all'
      or outlet_id = auth.uid()
      or (visibility = 'group' and public.same_buying_group(outlet_id))
    )
  );

-- Update requests visibility to respect group-only restriction
drop policy if exists "Requests viewable by paid members only" on requests;
create policy "Requests viewable respecting group visibility"
  on requests for select
  using (
    public.is_paid_member()
    and (
      visibility = 'all'
      or outlet_id = auth.uid()
      or (visibility = 'group' and public.same_buying_group(outlet_id))
    )
  );
