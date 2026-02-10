# Vercel + Standalone Supabase Migration Runbook

This runbook is the execution checklist for moving Pathline from Lovable cloud auth to direct Supabase auth and deploying on Vercel.

## 1) Baseline and safety

1. Create a migration branch.
2. Verify current app behavior before cutover:
   - Email/password auth works
   - Google auth works
   - Backup export/import works
3. Keep rollback available (do not delete previous deployment settings until validation is complete).

## 2) Supabase project setup

1. Create a new Supabase project.
2. Apply SQL migrations from `supabase/migrations` in chronological order.
3. Confirm these tables exist and are writable by authenticated users under your RLS policies:
   - `user_accounts`
   - `monthly_expenses`
   - `financial_snapshots`
   - `income_events`
   - `income_settings`
   - `credit_scores`
   - `category_settings`

## 3) Supabase auth setup (Google OAuth)

In Supabase Auth settings:
1. Enable `Google` provider.
2. Set **Site URL** to production URL (custom domain later, Vercel URL first).
3. Add **Redirect URLs** for:
   - `http://localhost:8080/`
   - `https://<your-vercel-domain>/`
   - `https://<your-custom-domain>/` (after domain cutover)

In Google Cloud OAuth client:
1. Add Supabase callback URL provided in Supabase provider settings.
2. Ensure same authorized domains/origins align with production and local testing.

## 4) App environment variables

Set these values locally and in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

## 5) Vercel deployment

1. Import the GitHub repo into Vercel.
2. Use Vite framework preset.
3. Configure environment variables listed above.
4. Deploy.
5. Verify SPA routing rewrite from `vercel.json` is active.

## 6) Post-deploy validation

Validate on the deployed URL:
1. Email sign-up/sign-in/sign-out
2. Google sign-in round trip
3. Core data write/read paths
4. Backup export/import from floating menu

## 7) Data migration + domain cutover

1. Open deployed app and sign in with your user.
2. Import exported ZIP backup.
3. Validate key record counts and core screens.
4. Add custom domain in Vercel and update DNS.
5. Re-test auth callback and backup import/export on final domain.

