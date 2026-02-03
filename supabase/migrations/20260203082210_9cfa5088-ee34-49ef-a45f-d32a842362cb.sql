-- Create user_accounts table for storing financial account data
CREATE TABLE public.user_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'checking',
  balance NUMERIC NOT NULL DEFAULT 0,
  interest_rate NUMERIC DEFAULT 0,
  credit_limit NUMERIC DEFAULT 0,
  min_payment NUMERIC DEFAULT 0,
  due_date INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_snapshots table for tracking financial state over time
CREATE TABLE public.financial_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_assets NUMERIC NOT NULL DEFAULT 0,
  total_liabilities NUMERIC NOT NULL DEFAULT 0,
  net_worth NUMERIC NOT NULL DEFAULT 0,
  monthly_income NUMERIC DEFAULT 0,
  monthly_expenses NUMERIC DEFAULT 0,
  savings_rate NUMERIC DEFAULT 0,
  accounts_data JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create income_events table for tracking income sources
CREATE TABLE public.income_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  frequency TEXT NOT NULL DEFAULT 'monthly',
  next_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  category TEXT DEFAULT 'salary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly_expenses table for tracking recurring expenses
CREATE TABLE public.monthly_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'other',
  is_essential BOOLEAN NOT NULL DEFAULT false,
  due_date INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_accounts
CREATE POLICY "Users can view their own accounts"
  ON public.user_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts"
  ON public.user_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts"
  ON public.user_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts"
  ON public.user_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for financial_snapshots
CREATE POLICY "Users can view their own snapshots"
  ON public.financial_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own snapshots"
  ON public.financial_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snapshots"
  ON public.financial_snapshots FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snapshots"
  ON public.financial_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for income_events
CREATE POLICY "Users can view their own income events"
  ON public.income_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own income events"
  ON public.income_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own income events"
  ON public.income_events FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own income events"
  ON public.income_events FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for monthly_expenses
CREATE POLICY "Users can view their own expenses"
  ON public.monthly_expenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses"
  ON public.monthly_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON public.monthly_expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON public.monthly_expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_accounts_updated_at
  BEFORE UPDATE ON public.user_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_income_events_updated_at
  BEFORE UPDATE ON public.income_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_expenses_updated_at
  BEFORE UPDATE ON public.monthly_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_user_accounts_user_id ON public.user_accounts(user_id);
CREATE INDEX idx_financial_snapshots_user_id ON public.financial_snapshots(user_id);
CREATE INDEX idx_financial_snapshots_date ON public.financial_snapshots(snapshot_date);
CREATE INDEX idx_income_events_user_id ON public.income_events(user_id);
CREATE INDEX idx_monthly_expenses_user_id ON public.monthly_expenses(user_id);