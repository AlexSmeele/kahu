-- Fix storage policies for profile photo uploads
-- Drop existing policies first
DROP POLICY IF EXISTS "Profile photos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photo" ON storage.objects;

-- Create corrected storage policies for profile photo uploads
CREATE POLICY "Profile photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their own profile photo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can update their own profile photo" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

CREATE POLICY "Users can delete their own profile photo" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-photos' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);