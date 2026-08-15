-- ============================================================
-- SwapYard — admin feature migration
-- Run this in Supabase: Dashboard -> SQL Editor -> New query
-- (This is IN ADDITION to the original supabase-schema.sql —
-- don't re-run that one, just run this.)
-- ============================================================

alter table profiles add column is_admin boolean default false;

-- After running this, make YOUR account the admin.
-- Sign up for a normal SwapYard account first (through /signup)
-- using your own email, then run this line, replacing the email:

-- update profiles set is_admin = true where contact_email = 'your-email@example.com';
