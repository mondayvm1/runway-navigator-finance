
-- Add interest_rate column to user_accounts table
ALTER TABLE public.user_accounts 
ADD COLUMN interest_rate numeric DEFAULT 0;

-- Update existing records to have default interest rates based on category
UPDATE public.user_accounts 
SET interest_rate = CASE 
  WHEN category = 'cash' THEN 0.5
  WHEN category = 'investments' THEN 8.0
  WHEN category = 'credit' THEN 24.99
  WHEN category = 'loans' THEN 7.5
  WHEN category = 'otherAssets' THEN 3.0
  ELSE 0
END
WHERE interest_rate IS NULL OR interest_rate = 0;
