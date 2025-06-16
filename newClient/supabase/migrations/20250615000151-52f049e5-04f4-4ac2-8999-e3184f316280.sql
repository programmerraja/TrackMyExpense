
-- Step 1: Create a new enum for category types
CREATE TYPE public.category_type AS ENUM ('INCOME', 'EXPENSE', 'DEBT', 'TAX', 'INVESTMENT');

-- Step 2: Create the categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type public.category_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name, type)
);

-- Add comment for table
COMMENT ON TABLE public.categories IS 'Stores user-defined and predefined categories for transactions and investments.';

-- Step 3: Enable RLS on the categories table
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Step 4: Define RLS policies for categories
CREATE POLICY "Users can view their own and default categories"
  ON public.categories
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 5: Insert predefined categories
INSERT INTO public.categories (name, type) VALUES
  ('INCOME', 'INCOME'),
  ('HOME', 'EXPENSE'),
  ('FOOD', 'EXPENSE'),
  ('TRAVEL', 'EXPENSE'),
  ('ENTERTAINMENT', 'EXPENSE'),
  ('MEDICAL', 'EXPENSE'),
  ('SPORTS', 'EXPENSE'),
  ('BILLS', 'EXPENSE'),
  ('OTHER', 'EXPENSE'),
  ('DEBT', 'DEBT'),
  ('TAX', 'TAX'),
  ('INVESTMENT', 'INVESTMENT');

-- Step 6: Add category_id to transactions table
ALTER TABLE public.transactions ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Step 7: Update category_id in transactions based on existing category name
UPDATE public.transactions t
SET category_id = (SELECT c.id FROM public.categories c WHERE c.name = t.category AND c.user_id IS NULL LIMIT 1);

-- Step 8: Alter transactions table to drop old category column and make new one NOT NULL
ALTER TABLE public.transactions DROP COLUMN category;
ALTER TABLE public.transactions ALTER COLUMN category_id SET NOT NULL;

-- Step 9: Add category_id to investments table
ALTER TABLE public.investments ADD COLUMN category_id UUID REFERENCES public.categories(id);

-- Step 10: Set a default category for existing investments and make it NOT NULL
UPDATE public.investments
SET category_id = (SELECT id FROM public.categories WHERE name = 'INVESTMENT' AND user_id IS NULL)
WHERE category_id IS NULL;
ALTER TABLE public.investments ALTER COLUMN category_id SET NOT NULL;

-- Step 11: Create indexes on category_id for performance
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_investments_category_id ON public.investments(category_id);
