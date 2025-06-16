
-- Enable Row Level Security on investments table (if not already enabled)
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Create policies for investments table (only if they don't exist)
DO $$ 
BEGIN
    -- Check and create investment policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investments' AND policyname = 'Users can view their own investments') THEN
        CREATE POLICY "Users can view their own investments" 
          ON public.investments 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investments' AND policyname = 'Users can create their own investments') THEN
        CREATE POLICY "Users can create their own investments" 
          ON public.investments 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investments' AND policyname = 'Users can update their own investments') THEN
        CREATE POLICY "Users can update their own investments" 
          ON public.investments 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'investments' AND policyname = 'Users can delete their own investments') THEN
        CREATE POLICY "Users can delete their own investments" 
          ON public.investments 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create a database function for calculating transaction summaries
CREATE OR REPLACE FUNCTION get_transaction_summary(user_uuid UUID, start_date DATE DEFAULT NULL, end_date DATE DEFAULT NULL)
RETURNS TABLE (
  total_income NUMERIC,
  total_expenses NUMERIC,
  total_taxes NUMERIC,
  total_debt_given NUMERIC,
  total_debt_bought NUMERIC,
  monthly_savings NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN type = 'INCOME_TAX' THEN amount ELSE 0 END), 0) as total_taxes,
    COALESCE(SUM(CASE WHEN type = 'DEBT_GIVEN' THEN amount ELSE 0 END), 0) as total_debt_given,
    COALESCE(SUM(CASE WHEN type = 'DEBT_BOUGHT' THEN amount ELSE 0 END), 0) as total_debt_bought,
    COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN type IN ('EXPENSE', 'INCOME_TAX') THEN amount ELSE 0 END), 0) as monthly_savings
  FROM transactions 
  WHERE user_id = user_uuid
    AND (start_date IS NULL OR event_date >= start_date)
    AND (end_date IS NULL OR event_date <= end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
