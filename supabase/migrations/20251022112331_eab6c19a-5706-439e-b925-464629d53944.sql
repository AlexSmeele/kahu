-- Add new onboarding fields to dogs table
ALTER TABLE dogs 
ADD COLUMN IF NOT EXISTS age_range text,
ADD COLUMN IF NOT EXISTS known_commands jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS behavioral_goals jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS training_time_commitment text,
ADD COLUMN IF NOT EXISTS is_shelter_dog boolean DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN dogs.age_range IS 'Age range: under_6m, 6_12m, 1_2y, 2_7y, over_7y';
COMMENT ON COLUMN dogs.known_commands IS 'Array of command names the dog already knows';
COMMENT ON COLUMN dogs.behavioral_goals IS 'Array of behavioral issues to work on';
COMMENT ON COLUMN dogs.training_time_commitment IS 'Daily training time: under_5min, 5_10min, 10_20min, over_20min';