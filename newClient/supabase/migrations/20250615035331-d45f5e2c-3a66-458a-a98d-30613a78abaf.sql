
-- Make category_id nullable in the investments table since we removed it from the form
ALTER TABLE public.investments 
ALTER COLUMN category_id DROP NOT NULL;
