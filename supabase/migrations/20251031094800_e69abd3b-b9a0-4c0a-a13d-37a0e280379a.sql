-- Update the Dev User profile to generic user data
UPDATE profiles 
SET 
  display_name = 'Demo User',
  avatar_url = NULL
WHERE id = 'b197063d-9f5b-42c3-888e-3e85e8829141';