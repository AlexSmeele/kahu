-- Add water bowl cleaning tracking to nutrition plans
ALTER TABLE nutrition_plans 
  ADD COLUMN IF NOT EXISTS water_bowl_last_cleaned TIMESTAMP WITH TIME ZONE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_water_bowl ON nutrition_plans(water_bowl_last_cleaned);

-- Add comment for documentation
COMMENT ON COLUMN nutrition_plans.water_bowl_last_cleaned IS 'Last time the water bowl was cleaned';
COMMENT ON COLUMN nutrition_plans.bowl_last_cleaned IS 'Last time the food bowl was cleaned';