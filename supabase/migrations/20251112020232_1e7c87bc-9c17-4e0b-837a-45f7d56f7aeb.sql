-- Add proficiency tracking to dog_tricks table
ALTER TABLE dog_tricks
ADD COLUMN proficiency_level text NOT NULL DEFAULT 'basic',
ADD COLUMN basic_completed_at timestamp with time zone,
ADD COLUMN generalized_completed_at timestamp with time zone,
ADD COLUMN proofed_completed_at timestamp with time zone,
ADD COLUMN last_practiced_at timestamp with time zone,
ADD COLUMN practice_contexts jsonb DEFAULT '[]'::jsonb;

-- Add constraint for proficiency_level
ALTER TABLE dog_tricks
ADD CONSTRAINT dog_tricks_proficiency_level_check 
CHECK (proficiency_level IN ('basic', 'generalized', 'proofed'));

-- Backfill existing mastered tricks to basic level
UPDATE dog_tricks
SET basic_completed_at = mastered_at,
    proficiency_level = 'basic'
WHERE status = 'mastered' AND basic_completed_at IS NULL;

-- Add roadmap fields to tricks table
ALTER TABLE tricks
ADD COLUMN min_age_weeks integer,
ADD COLUMN skill_type text,
ADD COLUMN recommended_practice_frequency_days integer DEFAULT 7;

-- Add constraint for skill_type
ALTER TABLE tricks
ADD CONSTRAINT tricks_skill_type_check 
CHECK (skill_type IS NULL OR skill_type IN ('obedience', 'performance', 'practical', 'body_control'));

-- Create skill_progression_requirements table
CREATE TABLE skill_progression_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trick_id uuid NOT NULL REFERENCES tricks(id) ON DELETE CASCADE,
  proficiency_level text NOT NULL CHECK (proficiency_level IN ('basic', 'generalized', 'proofed')),
  min_sessions_required integer NOT NULL DEFAULT 10,
  contexts_required jsonb DEFAULT '[]'::jsonb,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(trick_id, proficiency_level)
);

-- Enable RLS on skill_progression_requirements
ALTER TABLE skill_progression_requirements ENABLE ROW LEVEL SECURITY;

-- Anyone can view progression requirements
CREATE POLICY "Anyone can view skill progression requirements"
ON skill_progression_requirements FOR SELECT
USING (true);

-- Enhance training_sessions table with practice tracking
ALTER TABLE training_sessions
ADD COLUMN practice_context text,
ADD COLUMN distraction_level text CHECK (distraction_level IS NULL OR distraction_level IN ('none', 'mild', 'moderate', 'high')),
ADD COLUMN success_rate_percentage integer CHECK (success_rate_percentage IS NULL OR (success_rate_percentage >= 0 AND success_rate_percentage <= 100));

-- Create indexes for faster queries
CREATE INDEX idx_dog_tricks_proficiency ON dog_tricks(dog_id, proficiency_level);
CREATE INDEX idx_dog_tricks_last_practiced ON dog_tricks(dog_id, last_practiced_at);

-- Insert default progression requirements for basic skills
INSERT INTO skill_progression_requirements (trick_id, proficiency_level, min_sessions_required, contexts_required, description)
SELECT 
  id as trick_id,
  'basic' as proficiency_level,
  10 as min_sessions_required,
  '["indoor_controlled"]'::jsonb as contexts_required,
  'Master the basic behavior in a controlled indoor environment with minimal distractions.' as description
FROM tricks
WHERE category IN ('obedience', 'basic');

INSERT INTO skill_progression_requirements (trick_id, proficiency_level, min_sessions_required, contexts_required, description)
SELECT 
  id as trick_id,
  'generalized' as proficiency_level,
  15 as min_sessions_required,
  '["indoor_controlled", "outdoor_quiet", "different_locations"]'::jsonb as contexts_required,
  'Practice in multiple locations and contexts to ensure the dog understands the cue anywhere.' as description
FROM tricks
WHERE category IN ('obedience', 'basic');

INSERT INTO skill_progression_requirements (trick_id, proficiency_level, min_sessions_required, contexts_required, description)
SELECT 
  id as trick_id,
  'proofed' as proficiency_level,
  20 as min_sessions_required,
  '["with_mild_distractions", "with_moderate_distractions", "with_high_distractions"]'::jsonb as contexts_required,
  'Solidify the behavior under real-world distractions like other dogs, food, loud noises, etc.' as description
FROM tricks
WHERE category IN ('obedience', 'basic');