-- ============================================================
-- SwapYard — fix: auto-create profile on signup
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, outlet_name, county, contact_email, contact_phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'outlet_name', 'New Outlet'),
    coalesce(new.raw_user_meta_data->>'county', ''),
    new.email,
    new.raw_user_meta_data->>'contact_phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
