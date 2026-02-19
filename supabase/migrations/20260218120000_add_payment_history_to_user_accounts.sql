-- Add payment history for credit card payments (amount, note, date)
ALTER TABLE public.user_accounts
  ADD COLUMN IF NOT EXISTS payment_history JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.user_accounts.payment_history IS 'Array of { date: string (YYYY-MM-DD), amount: number, note?: string } for recorded payments';
