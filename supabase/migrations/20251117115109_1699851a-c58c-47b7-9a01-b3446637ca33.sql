-- Phase 2: Clean up unused columns from skills table
ALTER TABLE skills 
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS instructions;

-- Set proper defaults
ALTER TABLE skills 
ALTER COLUMN priority_order SET DEFAULT 0,
ALTER COLUMN skill_type SET DEFAULT 'foundational',
ALTER COLUMN recommended_practice_frequency_days SET DEFAULT 1;