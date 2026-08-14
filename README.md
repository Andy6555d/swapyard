# SwapYard — Setup & Reference Guide

An internal noticeboard for independent merchant outlets to move aged/surplus
stock to each other, and to post requests for stock they're looking for.
No commission, no payment processing — outlets contact each other directly
and arrange the deal and delivery themselves.

Live at: **swapyard.ie** (hosted on Vercel, database on Supabase)

---

## What's built

- **Public homepage** (`/`) — marketing page, no login required. Shows live
  stats (active listings, outlets, counties), the €200/year fee, and a
  "How it Works" section.
- **Individual outlet logins** — self-registration with outlet name, county,
  and contact details.
- **Browse Stock** (`/browse`) — all active listings, filterable by category
  (grouped by your real product taxonomy — Main Group → Subgroup), county,
  and free-text search.
- **List Stock** (`/list`) — post surplus/aged stock with photos, quantity,
  description, and asking price.
- **My Listings** (`/my-listings`) — each outlet manages only their own
  listings: mark as sold, relist, or delete.
- **Requests** (`/requests`) — "ask if anyone has it" board. Post what
  you're looking for; other outlets can reach out if they have it.
- **Admin dashboard** (`/admin`, visible only to admin accounts) — set or
  reset any outlet's password, send password-reset emails, remove outlets,
  or moderate/delete any listing.

## What's NOT included (by design)

- No payment processing — outlets arrange payment and delivery themselves.
- No paywall/billing yet — the €200/year fee is a business decision, not
  yet enforced in the app. Add later once ready.

---

## One-time setup (already done, kept here for reference)

All of this is done through web dashboards — no terminal needed.

### 1. Database (Supabase)
Run, in this order, in Supabase → SQL Editor:
1. `supabase-schema.sql` — core tables (profiles, listings) + storage bucket
2. `supabase-schema-trigger-fix.sql` — auto-creates a profile row on signup
3. `supabase-schema-admin-update.sql` — adds the `is_admin` flag
4. `supabase-schema-requests.sql` — adds the requests table

Storage: a public bucket named `listing-images` (Storage → New bucket).

### 2. Code (GitHub → Vercel)
Code lives in a GitHub repo, connected to Vercel for automatic deploys.
Every time a file is uploaded/replaced in GitHub and committed, Vercel
rebuilds and redeploys automatically within about a minute.

### 3. Environment variables (set in Vercel → Settings → Environment Variables)
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase → Settings → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the Publishable/anon key, same page
- `SUPABASE_SERVICE_ROLE_KEY` — the **Secret** key, same page. Never
  prefix this with `NEXT_PUBLIC_` — it must stay server-side only, since
  it has full admin access to the database.

### 4. Domain
`swapyard.ie` is connected via DNS records (A + CNAME) at the registrar
(register365), pointing at Vercel. Managed in Vercel → Settings → Domains.

### 5. Making yourself admin
Sign up for a normal account, then in Supabase SQL Editor:
```sql
update profiles set is_admin = true where contact_email = 'your-email@example.com';
```

---

## Making changes going forward

Any time you want something changed, ask and you'll get updated files back.
Upload the changed file(s) into the same GitHub repo (same path, GitHub
offers to replace it), commit, and Vercel redeploys automatically.

## Security note

Kept up to date with Next.js security patches as they're flagged during
builds — worth keeping an eye on Vercel's build logs for any new warnings
about `next` or `@supabase/*` package versions.
