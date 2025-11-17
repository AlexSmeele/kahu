-- Rename tricks table to skills
ALTER TABLE tricks RENAME TO skills;

-- Rename dog_tricks table to dog_skills
ALTER TABLE dog_tricks RENAME TO dog_skills;

-- Rename trick_id column to skill_id in dog_skills table
ALTER TABLE dog_skills RENAME COLUMN trick_id TO skill_id;

-- Add enriched data columns to skills table
ALTER TABLE skills ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS brief_instructions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS detailed_instructions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS general_tips TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS troubleshooting TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS preparation_tips TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS training_insights TEXT;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS achievement_levels JSONB DEFAULT '{}'::jsonb;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS ideal_stage_timeline JSONB DEFAULT '{}'::jsonb;
ALTER TABLE skills ADD COLUMN IF NOT EXISTS criteria JSONB DEFAULT '{}'::jsonb;

-- Update foreign key constraint in dog_skills
ALTER TABLE dog_skills DROP CONSTRAINT IF EXISTS dog_tricks_trick_id_fkey;
ALTER TABLE dog_skills ADD CONSTRAINT dog_skills_skill_id_fkey 
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE;

-- Drop old RLS policies on dog_tricks (now dog_skills)
DROP POLICY IF EXISTS "Users can delete dog tricks" ON dog_skills;
DROP POLICY IF EXISTS "Users can insert dog tricks" ON dog_skills;
DROP POLICY IF EXISTS "Users can update dog tricks" ON dog_skills;
DROP POLICY IF EXISTS "Users can view dog tricks" ON dog_skills;

-- Create new RLS policies on dog_skills
CREATE POLICY "Users can view dog skills"
  ON dog_skills FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dogs WHERE dogs.id = dog_skills.dog_id AND dogs.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert dog skills"
  ON dog_skills FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM dogs WHERE dogs.id = dog_skills.dog_id AND dogs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update dog skills"
  ON dog_skills FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM dogs WHERE dogs.id = dog_skills.dog_id AND dogs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete dog skills"
  ON dog_skills FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM dogs WHERE dogs.id = dog_skills.dog_id AND dogs.user_id = auth.uid()
  ));

-- Drop old RLS policies on tricks (now skills)
DROP POLICY IF EXISTS "Tricks are viewable by everyone" ON skills;

-- Create new RLS policies on skills
CREATE POLICY "Skills are viewable by everyone"
  ON skills FOR SELECT
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_skills ENABLE ROW LEVEL SECURITY;

-- Update triggers if any exist
DROP TRIGGER IF EXISTS update_dog_tricks_updated_at ON dog_skills;
CREATE TRIGGER update_dog_skills_updated_at
  BEFORE UPDATE ON dog_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tricks_updated_at ON skills;
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();