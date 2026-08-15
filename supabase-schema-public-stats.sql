-- ============================================================
-- SwapYard — public homepage stats fix
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================
-- Why: the profiles table is (correctly) only readable by logged-in
-- users, to protect outlet emails/phone numbers from public scraping.
-- But that meant the public homepage couldn't show real outlet/county
-- counts to logged-out visitors. This function returns ONLY the two
-- numbers — no names, emails, or phone numbers — so it's safe to make
-- available to anyone, without opening up the underlying table.

create or replace function public.get_public_stats()
returns table (outlet_count bigint, county_count bigint)
language sql
security definer
set search_path = public
as $$
  select count(*) as outlet_count, count(distinct county) as county_count
  from profiles;
$$;

grant execute on function public.get_public_stats() to anon, authenticated;
