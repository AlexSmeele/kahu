-- Create custom_breeds table for user-defined and mixed breeds
CREATE TABLE public.custom_breeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  notes TEXT,
  -- Parent breeds for mixed breeds (up to 3 parents with percentages)
  parent_breed_1_id UUID REFERENCES dog_breeds(id),
  parent_breed_1_percentage INTEGER CHECK (parent_breed_1_percentage > 0 AND parent_breed_1_percentage <= 100),
  parent_breed_2_id UUID REFERENCES dog_breeds(id),
  parent_breed_2_percentage INTEGER CHECK (parent_breed_2_percentage > 0 AND parent_breed_2_percentage <= 100),
  parent_breed_3_id UUID REFERENCES dog_breeds(id),
  parent_breed_3_percentage INTEGER CHECK (parent_breed_3_percentage > 0 AND parent_breed_3_percentage <= 100),
  -- User overrides for breed characteristics
  exercise_needs_override TEXT,
  weight_male_adult_min_override NUMERIC,
  weight_male_adult_max_override NUMERIC,
  weight_female_adult_min_override NUMERIC,
  weight_female_adult_max_override NUMERIC,
  temperament_override TEXT,
  grooming_needs_override TEXT,
  health_notes_override TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_percentages_sum CHECK (
    CASE 
      WHEN parent_breed_3_id IS NOT NULL THEN 
        parent_breed_1_percentage + parent_breed_2_percentage + parent_breed_3_percentage = 100
      WHEN parent_breed_2_id IS NOT NULL THEN 
        parent_breed_1_percentage + parent_breed_2_percentage = 100
      ELSE parent_breed_1_percentage = 100 OR parent_breed_1_percentage IS NULL
    END
  )
);

-- Add custom_breed_id to dogs table
ALTER TABLE dogs ADD COLUMN custom_breed_id UUID REFERENCES custom_breeds(id) ON DELETE SET NULL;

-- Add constraint to ensure only one breed type is set
ALTER TABLE dogs ADD CONSTRAINT check_single_breed_reference 
CHECK ((breed_id IS NOT NULL AND custom_breed_id IS NULL) OR (breed_id IS NULL AND custom_breed_id IS NOT NULL));

-- Enable RLS on custom_breeds
ALTER TABLE custom_breeds ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for custom_breeds
CREATE POLICY "Users can view their own custom breeds"
ON custom_breeds FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom breeds"
ON custom_breeds FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom breeds"
ON custom_breeds FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom breeds"
ON custom_breeds FOR DELETE
USING (auth.uid() = user_id);

-- Allow authenticated users to insert into dog_breeds (for custom breed creation fallback)
CREATE POLICY "Authenticated users can add custom breeds to dog_breeds"
ON dog_breeds FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Add trigger for updated_at
CREATE TRIGGER update_custom_breeds_updated_at
BEFORE UPDATE ON custom_breeds
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();