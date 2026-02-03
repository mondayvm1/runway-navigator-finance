-- Add missing date columns to income_events
ALTER TABLE public.income_events ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.income_events ADD COLUMN IF NOT EXISTS end_date DATE;