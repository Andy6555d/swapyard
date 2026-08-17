-- ============================================================
-- SwapYard — push notifications
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================

-- Notification preferences live on the outlet's own profile
alter table profiles add column push_enabled boolean default false;
alter table profiles add column notify_categories text[];  -- null/empty = all categories
alter table profiles add column notify_county_only boolean default false; -- true = only their own county

-- One row per subscribed browser/device
create table push_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  outlet_id uuid references profiles(id) on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);

alter table push_subscriptions enable row level security;

create policy "Users can insert their own push subscription"
  on push_subscriptions for insert
  with check (auth.uid() = outlet_id);

create policy "Users can view their own push subscriptions"
  on push_subscriptions for select
  using (auth.uid() = outlet_id);

create policy "Users can delete their own push subscriptions"
  on push_subscriptions for delete
  using (auth.uid() = outlet_id);
