-- ============================================================
-- SwapYard — billing/paywall migration
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================

alter table profiles add column stripe_customer_id text;
alter table profiles add column stripe_subscription_id text;
alter table profiles add column subscription_status text default 'inactive';
alter table profiles add column subscription_current_period_end timestamptz;

-- subscription_status values used by the app:
--   'inactive'  — never subscribed (default for new signups)
--   'active'    — paid and current
--   'past_due'  — payment failed, Stripe retrying
--   'canceled'  — subscription ended
--   'comp'      — manually granted free access by admin (no Stripe involved)
