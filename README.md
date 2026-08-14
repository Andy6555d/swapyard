# SwapYard — Setup Guide

Everything below is done through web dashboards — no terminal needed.

## 1. Create the database (Supabase)

1. Go to supabase.com, sign up free, click "New Project".
2. Give it a name (e.g. swapyard), set a database password (save it somewhere), pick a region close to Ireland (e.g. West EU), click "Create new project". Takes about 2 minutes to spin up.
3. In the left sidebar, click **SQL Editor** → **New query**.
4. Open the file `supabase-schema.sql` from this project, copy its entire contents, paste into the query box, and click **Run**. This creates the two tables (profiles, listings) and all the security rules.
5. In the left sidebar, click **Storage** → **New bucket**. Name it exactly `listing-images`, toggle **Public bucket** ON, click **Create bucket**.
6. In the left sidebar, click **Project Settings** → **API**. You'll need two values from this page in step 3 below:
   - **Project URL**
   - **anon public** key

## 2. Upload the code to GitHub

1. Go to github.com, log in, click the **+** icon top right → **New repository**. Name it `swapyard`, leave it Private or Public, click **Create repository** (don't add a README — we already have one).
2. On the new empty repo page, click **uploading an existing file**.
3. Drag the **entire unzipped `swapyard-app` folder contents** (all files and subfolders — `app`, `lib`, `package.json`, everything) into the upload box. GitHub preserves the folder structure automatically.
4. Click **Commit changes**.

## 3. Deploy on Vercel

1. Go to vercel.com, sign up using **Continue with GitHub**.
2. Click **Add New** → **Project**, find your `swapyard` repo, click **Import**.
3. Before clicking Deploy, open **Environment Variables** and add two:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste the Project URL from Supabase step 1.6
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste the anon public key from Supabase step 1.6
4. Click **Deploy**. Wait about a minute.
5. You'll get a live link like `swapyard.vercel.app` — that's what you share with outlets.

## Making changes later

Any time you want something changed, I can hand you updated files. Just upload the changed file(s) into the same GitHub repo (same drag-and-drop upload method, GitHub will ask if you want to replace the existing file — say yes), and Vercel redeploys automatically within a minute.

## What's included

- Individual login per outlet (email + password, set at signup)
- Self-registration with outlet name, county, and contact details
- Browse all active listings, filterable by category, county, and search
- List stock with photos, description, quantity, and price
- "My Listings" — each outlet sees and manages only their own listings (mark as sold, relist, delete)
- Contact happens by email (outlets reach out directly — no in-app messaging, no payments)

## What's NOT included (by design, for now)

- No payment processing — this is a noticeboard, not a marketplace; outlets arrange payment/delivery themselves
- No annual fee / paywall — deliberately left out per your request; can be added later once you're ready
- No admin panel — if you need to remove a listing or account manually, that's done directly in the Supabase dashboard (Table Editor) for now
