CREATE TABLE IF NOT EXISTS public.credit_monitoring_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('credit_karma', 'credit_sesame')),
  bureau TEXT,
  score INTEGER CHECK (score BETWEEN 300 AND 850),
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, source)
);

ALTER TABLE public.credit_monitoring_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own credit monitoring sources"
ON public.credit_monitoring_sources FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credit monitoring sources"
ON public.credit_monitoring_sources FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit monitoring sources"
ON public.credit_monitoring_sources FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit monitoring sources"
ON public.credit_monitoring_sources FOR DELETE
USING (auth.uid() = user_id);

