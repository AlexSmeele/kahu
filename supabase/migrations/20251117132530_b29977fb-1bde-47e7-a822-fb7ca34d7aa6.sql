-- Convert category column from text to text array, splitting on ' / '
ALTER TABLE skills 
ALTER COLUMN category TYPE text[] 
USING string_to_array(category, ' / ');

-- Add GIN index for fast array searches
CREATE INDEX idx_skills_category_gin ON skills USING GIN (category);

-- Add constraint to ensure no empty arrays
ALTER TABLE skills ADD CONSTRAINT category_not_empty 
CHECK (array_length(category, 1) > 0);