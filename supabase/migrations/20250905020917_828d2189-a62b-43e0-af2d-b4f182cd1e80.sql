-- Add policies to allow mock user operations for storage
CREATE POLICY "Allow mock user to upload dog photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'dog-photos' AND 
  ('550e8400-e29b-41d4-a716-446655440000'::text = (storage.foldername(name))[1])
);

CREATE POLICY "Allow mock user to view dog photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'dog-photos' AND 
  ('550e8400-e29b-41d4-a716-446655440000'::text = (storage.foldername(name))[1])
);

CREATE POLICY "Allow mock user to update dog photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'dog-photos' AND 
  ('550e8400-e29b-41d4-a716-446655440000'::text = (storage.foldername(name))[1])
);

CREATE POLICY "Allow mock user to delete dog photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'dog-photos' AND 
  ('550e8400-e29b-41d4-a716-446655440000'::text = (storage.foldername(name))[1])
);