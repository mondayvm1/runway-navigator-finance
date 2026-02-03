-- Add snapshot_id foreign key to user_accounts and monthly_expenses
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS snapshot_id UUID REFERENCES public.financial_snapshots(id) ON DELETE CASCADE;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;
ALTER TABLE public.monthly_expenses ADD COLUMN IF NOT EXISTS snapshot_id UUID REFERENCES public.financial_snapshots(id) ON DELETE CASCADE;

-- Create indexes for snapshot_id
CREATE INDEX IF NOT EXISTS idx_user_accounts_snapshot_id ON public.user_accounts(snapshot_id);
CREATE INDEX IF NOT EXISTS idx_monthly_expenses_snapshot_id ON public.monthly_expenses(snapshot_id);

-- Add income_enabled to income_settings table
ALTER TABLE public.income_settings ADD COLUMN IF NOT EXISTS income_enabled BOOLEAN DEFAULT false;