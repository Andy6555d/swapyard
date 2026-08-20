-- ============================================================
-- SwapYard, content reporting (notice-and-action mechanism)
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================

create table content_reports (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references listings(id) on delete cascade,
  request_id uuid references requests(id) on delete cascade,
  reporter_id uuid references profiles(id) not null,
  reason text not null,
  detail text,
  status text default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz default now()
);

alter table content_reports enable row level security;

create policy "Paid members can submit reports"
  on content_reports for insert
  to authenticated
  with check (public.is_paid_member() and reporter_id = auth.uid());

create policy "Only admins can view reports"
  on content_reports for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));
