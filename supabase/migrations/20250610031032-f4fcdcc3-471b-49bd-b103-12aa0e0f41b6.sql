
-- Add credit card specific columns to user_accounts table
ALTER TABLE user_accounts 
ADD COLUMN credit_limit NUMERIC,
ADD COLUMN due_date DATE,
ADD COLUMN minimum_payment NUMERIC;
