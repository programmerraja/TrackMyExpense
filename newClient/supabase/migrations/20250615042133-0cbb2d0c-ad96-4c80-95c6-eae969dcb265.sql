
-- Add new investment types to the enum
ALTER TYPE public.investment_type ADD VALUE IF NOT EXISTS 'PPF';
ALTER TYPE public.investment_type ADD VALUE IF NOT EXISTS 'EPF';
ALTER TYPE public.investment_type ADD VALUE IF NOT EXISTS 'NPS';

-- Add new enum for recurring frequency
CREATE TYPE public.recurring_frequency AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY');

-- Add new enum for interest rate type
CREATE TYPE public.interest_rate_type AS ENUM ('FIXED', 'VARIABLE');

-- Add new columns to investments table for recurring investments
ALTER TABLE public.investments 
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurring_frequency public.recurring_frequency,
ADD COLUMN recurring_amount NUMERIC,
ADD COLUMN interest_rate NUMERIC,
ADD COLUMN interest_rate_type public.interest_rate_type,
ADD COLUMN maturity_date DATE,
ADD COLUMN annual_limit NUMERIC,
ADD COLUMN start_date DATE,
ADD COLUMN is_paused BOOLEAN DEFAULT FALSE,
ADD COLUMN paused_since DATE,
ADD COLUMN skipped_months TEXT[],
ADD COLUMN equity_ratio NUMERIC,
ADD COLUMN debt_ratio NUMERIC;

-- Create interest rate history table
CREATE TABLE public.interest_rate_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE,
  rate NUMERIC NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on interest_rate_history table
ALTER TABLE public.interest_rate_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for interest_rate_history
CREATE POLICY "Users can view their own interest rate history" 
  ON public.interest_rate_history 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.investments 
      WHERE investments.id = interest_rate_history.investment_id 
      AND investments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own interest rate history" 
  ON public.interest_rate_history 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.investments 
      WHERE investments.id = interest_rate_history.investment_id 
      AND investments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own interest rate history" 
  ON public.interest_rate_history 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.investments 
      WHERE investments.id = interest_rate_history.investment_id 
      AND investments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own interest rate history" 
  ON public.interest_rate_history 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.investments 
      WHERE investments.id = interest_rate_history.investment_id 
      AND investments.user_id = auth.uid()
    )
  );
