-- Add meal_components column to meal_records table
ALTER TABLE public.meal_records 
ADD COLUMN meal_components jsonb NULL;

COMMENT ON COLUMN public.meal_records.meal_components IS 'Array of meal component objects: {name, brand?, amount, unit, category}';