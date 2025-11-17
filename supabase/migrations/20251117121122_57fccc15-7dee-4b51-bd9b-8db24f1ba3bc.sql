-- Add enriched training data columns to skills table
ALTER TABLE skills
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS long_description text,
ADD COLUMN IF NOT EXISTS brief_instructions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS detailed_instructions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS general_tips text,
ADD COLUMN IF NOT EXISTS troubleshooting text,
ADD COLUMN IF NOT EXISTS preparation_tips text,
ADD COLUMN IF NOT EXISTS training_insights text,
ADD COLUMN IF NOT EXISTS achievement_levels jsonb,
ADD COLUMN IF NOT EXISTS ideal_stage_timeline jsonb,
ADD COLUMN IF NOT EXISTS pass_criteria text,
ADD COLUMN IF NOT EXISTS fail_criteria text,
ADD COLUMN IF NOT EXISTS mastery_criteria text;

-- Add comment explaining the enriched data structure
COMMENT ON COLUMN skills.brief_instructions IS 'Array of 3 brief instruction steps in JSONB format';
COMMENT ON COLUMN skills.detailed_instructions IS 'Array of 5 detailed instruction steps in JSONB format';
COMMENT ON COLUMN skills.achievement_levels IS 'JSONB object with level1, level2, level3 achievement descriptions';
COMMENT ON COLUMN skills.ideal_stage_timeline IS 'JSONB object with week recommendations for each proficiency level';