-- Phase 1: Extend nutrition_plans table with new tracking fields
ALTER TABLE nutrition_plans 
  ADD COLUMN IF NOT EXISTS diet_type TEXT CHECK (diet_type IN ('kibble', 'wet', 'raw', 'home_cooked', 'mixed', 'prescription', 'grain_free')),
  ADD COLUMN IF NOT EXISTS calorie_target_daily INTEGER,
  ADD COLUMN IF NOT EXISTS feeding_method TEXT CHECK (feeding_method IN ('scheduled', 'free_feeding', 'mixed')),
  ADD COLUMN IF NOT EXISTS bowl_type TEXT CHECK (bowl_type IN ('stainless', 'ceramic', 'plastic', 'elevated')),
  ADD COLUMN IF NOT EXISTS bowl_last_cleaned TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS food_bag_opened_date DATE,
  ADD COLUMN IF NOT EXISTS food_expiration_date DATE,
  ADD COLUMN IF NOT EXISTS batch_lot_number TEXT;

-- Phase 1: Extend meal_records table with consumption and behavior tracking
ALTER TABLE meal_records
  ADD COLUMN IF NOT EXISTS amount_planned DECIMAL,
  ADD COLUMN IF NOT EXISTS amount_consumed DECIMAL,
  ADD COLUMN IF NOT EXISTS percentage_eaten INTEGER CHECK (percentage_eaten >= 0 AND percentage_eaten <= 100),
  ADD COLUMN IF NOT EXISTS eating_speed TEXT CHECK (eating_speed IN ('fast', 'normal', 'slow')),
  ADD COLUMN IF NOT EXISTS eating_behavior TEXT CHECK (eating_behavior IN ('eager', 'normal', 'reluctant', 'sniffed_only', 'refused')),
  ADD COLUMN IF NOT EXISTS snubbed_items JSONB,
  ADD COLUMN IF NOT EXISTS food_temperature TEXT CHECK (food_temperature IN ('room_temp', 'chilled', 'warmed')),
  ADD COLUMN IF NOT EXISTS fed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS bowl_cleaned_before BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vomited_after BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS vomit_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS energy_level_after TEXT CHECK (energy_level_after IN ('low', 'normal', 'high')),
  ADD COLUMN IF NOT EXISTS begged_before BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS begged_after BOOLEAN DEFAULT false;

-- Create index on fed_by for performance
CREATE INDEX IF NOT EXISTS idx_meal_records_fed_by ON meal_records(fed_by);

-- Create index on bowl_last_cleaned for quick queries
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_bowl_cleaned ON nutrition_plans(bowl_last_cleaned);

-- Create index on expiration date for alerts
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_expiration ON nutrition_plans(food_expiration_date);

COMMENT ON COLUMN nutrition_plans.diet_type IS 'Type of diet: kibble, wet, raw, home_cooked, mixed, prescription, grain_free';
COMMENT ON COLUMN nutrition_plans.calorie_target_daily IS 'Target daily caloric intake in kcal';
COMMENT ON COLUMN nutrition_plans.bowl_last_cleaned IS 'Last time the food bowl was cleaned';
COMMENT ON COLUMN meal_records.percentage_eaten IS 'Percentage of meal consumed (0-100)';
COMMENT ON COLUMN meal_records.eating_behavior IS 'How the dog approached the meal';
COMMENT ON COLUMN meal_records.bowl_cleaned_before IS 'Whether bowl was cleaned before this meal';