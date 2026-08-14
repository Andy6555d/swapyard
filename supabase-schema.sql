-- ============================================================
-- SwapYard database schema
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query
-- Paste this whole file in and click "Run"
-- ============================================================

create extension if not exists "uuid-ossp";

-- One row per outlet, created automatically at signup
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  outlet_name text not null,
  county text not null,
  contact_email text not null,
  contact_phone text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by any logged-in member"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Listings
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
  status text default 'active' check (status in ('active','sold')),
  created_at timestamptz default now()
);

alter table listings enable row level security;

create policy "Listings are viewable by any logged-in member"
  on listings for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own listings"
  on listings for insert
  with check (auth.uid() = outlet_id);

create policy "Users can update their own listings"
  on listings for update
  using (auth.uid() = outlet_id);

create policy "Users can delete their own listings"
  on listings for delete
  using (auth.uid() = outlet_id);

-- ============================================================
-- Storage: also create a bucket named "listing-images" via
-- Dashboard -> Storage -> New bucket -> tick "Public bucket"
-- Then run the two policies below.
-- ============================================================

create policy "Logged-in members can upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-images');

create policy "Anyone with the link can view images"
  on storage.objects for select
  using (bucket_id = 'listing-images');
