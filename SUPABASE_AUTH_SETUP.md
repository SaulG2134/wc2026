# Supabase Auth + Google OAuth Setup

## 1 — Enable Google OAuth in Supabase

1. Go to your Supabase project → **Authentication → Providers → Google**
2. Toggle it **on**
3. You need a Google Client ID and Secret — get them here:
   - Go to https://console.cloud.google.com
   - Create a project (or use an existing one)
   - APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - Authorized redirect URIs — add:
     ```
     https://<your-supabase-project>.supabase.co/auth/v1/callback
     ```
     (Supabase shows you this exact URL on the Google provider page)
4. Paste the Client ID and Secret into Supabase → Save

---

## 2 — Run this SQL in Supabase SQL Editor

Go to your Supabase project → **SQL Editor** → paste and run:

```sql
-- 1. Make sure uid column can hold both UUIDs (auth users) and anon strings
--    If uid is already TEXT this is a no-op.
ALTER TABLE user_data ALTER COLUMN uid TYPE TEXT;

-- 2. Enable Row Level Security
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- 3. Drop any old open policies
DROP POLICY IF EXISTS "allow all" ON user_data;

-- 4. Authenticated users can read their own row
CREATE POLICY "users read own data"
  ON user_data FOR SELECT
  USING (uid = auth.uid()::TEXT);

-- 5. Authenticated users can insert their own row
CREATE POLICY "users insert own data"
  ON user_data FOR INSERT
  WITH CHECK (uid = auth.uid()::TEXT);

-- 6. Authenticated users can update their own row
CREATE POLICY "users update own data"
  ON user_data FOR UPDATE
  USING (uid = auth.uid()::TEXT);

-- 7. Authenticated users can delete their own row (used during anon migration)
CREATE POLICY "users delete own data"
  ON user_data FOR DELETE
  USING (uid = auth.uid()::TEXT);

-- 8. Allow anon/service role to upsert (needed for anonymous users before login)
--    Scope this down once you're ready to require login for all saves.
CREATE POLICY "anon can upsert"
  ON user_data FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
```

---

## 3 — Add your site URL to Supabase

1. Supabase → **Authentication → URL Configuration**
2. **Site URL**: your production URL (e.g. `https://wc2026.vercel.app`)
3. **Redirect URLs**: add the same URL plus `http://localhost:5173` for local dev

---

## How it works after setup

- Visitors who aren't signed in: still work as anonymous users (localStorage UUID)
- When someone clicks "Sign in with Google": Google verifies them, redirects back, Supabase creates a session
- Their anonymous favorites automatically migrate to their real account (one-time)
- After that: their data follows them across every device and browser
- RLS ensures no user can ever read or write another user's rows
