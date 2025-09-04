-- Create a mock profile for the development user
INSERT INTO public.profiles (id, display_name, role) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Dev User', 'owner')
ON CONFLICT (id) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role;