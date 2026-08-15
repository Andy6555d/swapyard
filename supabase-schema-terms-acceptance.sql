-- ============================================================
-- SwapYard — terms acceptance tracking
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================

alter table profiles add column terms_accepted_at timestamptz;

-- Update the signup trigger to record acceptance time automatically.
-- Since the app blocks account creation server-side unless the
-- checkbox was ticked, the moment this trigger fires IS the moment
-- of acceptance.
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
