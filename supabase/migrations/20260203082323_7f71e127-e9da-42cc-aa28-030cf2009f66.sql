-- Add missing columns to user_accounts that the old schema had
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'checking';
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS account_id TEXT;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS statement_date INTEGER DEFAULT 1;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS autopay_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS autopay_amount_type TEXT DEFAULT 'minimum';
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS autopay_custom_amount NUMERIC DEFAULT 0;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS is_paid_off BOOLEAN DEFAULT false;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS reports_to_experian BOOLEAN DEFAULT true;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS reports_to_transunion BOOLEAN DEFAULT true;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS reports_to_equifax BOOLEAN DEFAULT true;
ALTER TABLE public.user_accounts ADD COLUMN IF NOT EXISTS reporting_day INTEGER DEFAULT 1;

-- Add name column to financial_snapshots
ALTER TABLE public.financial_snapshots ADD COLUMN IF NOT EXISTS name TEXT;

-- Create category_settings table for hidden categories feature
CREATE TABLE IF NOT EXISTS public.category_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hidden_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on category_settings
ALTER TABLE public.category_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for category_settings
CREATE POLICY "Users can view their own category settings"
  ON public.category_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own category settings"
  ON public.category_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category settings"
  ON public.category_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category settings"
  ON public.category_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for category_settings
CREATE TRIGGER update_category_settings_updated_at
  BEFORE UPDATE ON public.category_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index
CREATE INDEX IF NOT EXISTS idx_category_settings_user_id ON public.category_settings(user_id);

-- Create income_settings table
CREATE TABLE IF NOT EXISTS public.income_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on income_settings
ALTER TABLE public.income_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for income_settings
CREATE POLICY "Users can view their own income settings"
  ON public.income_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income settings"
  ON public.income_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income settings"
  ON public.income_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income settings"
  ON public.income_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Add trigger for income_settings
CREATE TRIGGER update_income_settings_updated_at
  BEFORE UPDATE ON public.income_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index
CREATE INDEX IF NOT EXISTS idx_income_settings_user_id ON public.income_settings(user_id);