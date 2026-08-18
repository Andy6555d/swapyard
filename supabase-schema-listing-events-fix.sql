-- ============================================================
-- SwapYard, tighten listing_events RLS
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================
-- Why: the insert policy only checked that the caller was a paid
-- member, not that viewer_id actually matched their own account.
-- The app always set this correctly, but the database itself
-- didn't enforce it. This closes that gap.

drop policy if exists "Paid members can log events" on listing_events;

create policy "Paid members can log their own events"
  on listing_events for insert
  to authenticated
  with check (public.is_paid_member() and viewer_id = auth.uid());
