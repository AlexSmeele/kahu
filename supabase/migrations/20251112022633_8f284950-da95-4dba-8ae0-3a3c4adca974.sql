-- Add dog_trick_id to training_sessions to track which specific trick instance (proficiency level) the session relates to
ALTER TABLE training_sessions
ADD COLUMN dog_trick_id uuid REFERENCES dog_tricks(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX idx_training_sessions_dog_trick ON training_sessions(dog_trick_id);