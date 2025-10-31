-- Update Dev User to complete persona: Sarah Chen
UPDATE profiles 
SET 
  display_name = 'Sarah Chen',
  avatar_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
  phone = '+64 21 234 5678',
  address = '142 Beach Road',
  city = 'Auckland Central',
  state = 'Auckland',
  zip_code = '1010',
  country = 'New Zealand',
  updated_at = now()
WHERE id = 'b197063d-9f5b-42c3-888e-3e85e8829141';