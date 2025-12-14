-- Add credit bureau reporting fields to user_accounts
ALTER TABLE public.user_accounts 
ADD COLUMN reports_to_experian boolean DEFAULT true,
ADD COLUMN reports_to_transunion boolean DEFAULT true,
ADD COLUMN reports_to_equifax boolean DEFAULT true,
ADD COLUMN reporting_day integer CHECK (reporting_day >= 1 AND reporting_day <= 31);