
-- Add missing columns for income events and credit card data
ALTER TABLE user_accounts 
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'standard';

-- Create table for income events if it doesn't exist
CREATE TABLE IF NOT EXISTS public.income_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  snapshot_id UUID REFERENCES financial_snapshots(id),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'monthly', 'yearly')),
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for income_events
ALTER TABLE public.income_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own income events" ON public.income_events;
DROP POLICY IF EXISTS "Users can create their own income events" ON public.income_events;
DROP POLICY IF EXISTS "Users can update their own income events" ON public.income_events;
DROP POLICY IF EXISTS "Users can delete their own income events" ON public.income_events;

CREATE POLICY "Users can view their own income events" 
  ON public.income_events 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income events" 
  ON public.income_events 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income events" 
  ON public.income_events 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income events" 
  ON public.income_events 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create table for income settings
CREATE TABLE IF NOT EXISTS public.income_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  income_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for income_settings
ALTER TABLE public.income_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own income settings" ON public.income_settings;
DROP POLICY IF EXISTS "Users can create their own income settings" ON public.income_settings;
DROP POLICY IF EXISTS "Users can update their own income settings" ON public.income_settings;

CREATE POLICY "Users can view their own income settings" 
  ON public.income_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income settings" 
  ON public.income_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income settings" 
  ON public.income_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create table for category visibility settings
CREATE TABLE IF NOT EXISTS public.category_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  hidden_categories JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for category_settings
ALTER TABLE public.category_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own category settings" ON public.category_settings;
DROP POLICY IF EXISTS "Users can create their own category settings" ON public.category_settings;
DROP POLICY IF EXISTS "Users can update their own category settings" ON public.category_settings;

CREATE POLICY "Users can view their own category settings" 
  ON public.category_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own category settings" 
  ON public.category_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category settings" 
  ON public.category_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);
