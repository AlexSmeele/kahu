-- Add macronutrient tracking columns to nutrition_plans
ALTER TABLE public.nutrition_plans
ADD COLUMN IF NOT EXISTS protein_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS fat_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS fiber_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS carbs_percentage NUMERIC;

-- Add comment for clarity
COMMENT ON COLUMN public.nutrition_plans.protein_percentage IS 'Percentage of protein in diet (0-100)';
COMMENT ON COLUMN public.nutrition_plans.fat_percentage IS 'Percentage of fat in diet (0-100)';
COMMENT ON COLUMN public.nutrition_plans.fiber_percentage IS 'Percentage of fiber in diet (0-100)';
COMMENT ON COLUMN public.nutrition_plans.carbs_percentage IS 'Percentage of carbohydrates in diet (0-100)';