-- ============================================================
-- SwapYard — MASTER SCHEMA (definitive reference)
-- ============================================================
-- This file represents the complete, current production database
-- schema in one place. Every real schema change made to production
-- should be reflected here, in addition to its own standalone
-- migration file used to actually apply the change.
--
-- DO NOT run this against the current live database — everything
-- in it already exists there and most statements will error with
-- "already exists". This file exists for two purposes:
--   1. A single source of truth for what SHOULD exist in production
--   2. A clean rebuild script if the database ever needs recreating
--      from scratch (e.g. disaster recovery, or a staging copy)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (one row per outlet, linked to auth.users)
-- ============================================================
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  outlet_name text not null,
  county text not null,
  contact_email text not null,
  contact_phone text,
  is_admin boolean default false,
  terms_accepted_at timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  subscription_current_period_end timestamptz,
  push_enabled boolean default false,
  notify_categories text[],
  notify_county_only boolean default false,
  buying_group text,
  buying_group_verified boolean default false,
  created_at timestamptz default now()
);
-- subscription_status values: 'inactive' | 'active' | 'past_due' | 'canceled' | 'comp'
-- buying_group_verified: only true once an admin has reviewed and approved the claim

alter table profiles enable row level security;

create policy "Own profile always readable, others require paid access"
  on profiles for select
  using (auth.uid() = id or public.is_paid_member());

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- ============================================================
-- LISTINGS
-- ============================================================
create table listings (
  id uuid default uuid_generate_v4() primary key,
  outlet_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  county text not null,
  quantity text,
  price numeric(10,2) not null,
  image_urls text[] default '{}',
  status text default 'active',
  preferred_contact text default 'email',
  visibility text default 'all',
  sold_via_swapyard boolean,
  created_at timestamptz default now(),
  constraint listings_status_check check (status in ('active', 'reserved', 'sold')),
  constraint listings_preferred_contact_check check (preferred_contact in ('email', 'phone', 'both')),
  constraint listings_visibility_check check (visibility in ('all', 'group'))
);

alter table listings enable row level security;

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

create policy "Paid members can insert their own listings"
  on listings for insert
  with check (auth.uid() = outlet_id and public.is_paid_member());

create policy "Users can update their own listings"
  on listings for update
  using (auth.uid() = outlet_id);

create policy "Users can delete their own listings"
  on listings for delete
  using (auth.uid() = outlet_id);

-- ============================================================
-- REQUESTS
-- ============================================================
create table requests (
  id uuid default uuid_generate_v4() primary key,
  outlet_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null,
  county text not null,
  status text default 'open' check (status in ('open','fulfilled')),
  visibility text default 'all',
  fulfilled_via_swapyard boolean,
  created_at timestamptz default now(),
  constraint requests_visibility_check check (visibility in ('all', 'group'))
);

alter table requests enable row level security;

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

create policy "Paid members can insert their own requests"
  on requests for insert
  with check (auth.uid() = outlet_id and public.is_paid_member());

create policy "Users can update their own requests"
  on requests for update
  using (auth.uid() = outlet_id);

create policy "Users can delete their own requests"
  on requests for delete
  using (auth.uid() = outlet_id);

-- ============================================================
-- LISTING EVENTS (marketplace intelligence — contact reveals etc.)
-- ============================================================
create table listing_events (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references listings(id) on delete cascade,
  request_id uuid references requests(id) on delete cascade,
  event_type text not null check (event_type in ('contact_revealed', 'request_interest')),
  viewer_id uuid references profiles(id),
  created_at timestamptz default now()
);

alter table listing_events enable row level security;

create policy "Paid members can log their own events"
  on listing_events for insert
  to authenticated
  with check (public.is_paid_member() and viewer_id = auth.uid());

create policy "Owners and admins can view events on their own listings/requests"
  on listing_events for select
  using (
    exists (select 1 from listings where listings.id = listing_id and listings.outlet_id = auth.uid())
    or exists (select 1 from requests where requests.id = request_id and requests.outlet_id = auth.uid())
    or exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================================
-- PUSH SUBSCRIPTIONS (one row per subscribed browser/device)
-- ============================================================
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

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Is the current logged-in user a paying member (or admin)?
create or replace function public.is_paid_member()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and (subscription_status in ('active', 'comp') or is_admin = true)
  );
$$;

-- Does the current logged-in user share a VERIFIED buying group
-- with the given outlet? Both sides must be admin-verified, a
-- self-claimed unverified group never matches.
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

-- Public homepage stats — safe for logged-out visitors, exposes
-- only aggregate counts, never contact details.
create or replace function public.get_public_stats()
returns table (outlet_count bigint, county_count bigint)
language sql
security definer
set search_path = public
as $$
  select count(*) as outlet_count, count(distinct county) as county_count
  from profiles;
$$;

-- Auto-create a profile row the moment someone signs up, reading
-- details from the signup form's metadata. Runs regardless of
-- email-confirmation status, and always records the acceptance
-- timestamp for terms/privacy consent.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, outlet_name, county, contact_email, contact_phone, terms_accepted_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'outlet_name', 'New Outlet'),
    coalesce(new.raw_user_meta_data->>'county', ''),
    new.email,
    new.raw_user_meta_data->>'contact_phone',
    now()
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- STORAGE (photo uploads)
-- ============================================================
-- Bucket "listing-images" must also be created via:
-- Dashboard -> Storage -> New bucket -> name exactly "listing-images" -> Public bucket ON

create policy "Paid members can upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-images' and public.is_paid_member());

create policy "Anyone with the link can view images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Owners can delete their own uploaded images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'listing-images' and (storage.foldername(name))[1] = auth.uid()::text);
