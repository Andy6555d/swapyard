-- ============================================================
-- SwapYard — requests feature
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================

create table requests (
  id uuid default uuid_generate_v4() primary key,
  outlet_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null,
  county text not null,
  status text default 'open' check (status in ('open','fulfilled')),
  created_at timestamptz default now()
);

alter table requests enable row level security;

create policy "Requests are viewable by any logged-in member"
  on requests for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own requests"
  on requests for insert
  with check (auth.uid() = outlet_id);

create policy "Users can update their own requests"
  on requests for update
  using (auth.uid() = outlet_id);

create policy "Users can delete their own requests"
  on requests for delete
  using (auth.uid() = outlet_id);
