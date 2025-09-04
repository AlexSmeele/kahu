-- Create storage bucket for dog photos
INSERT INTO storage.buckets (id, name, public) VALUES ('dog-photos', 'dog-photos', true);

-- Create RLS policies for dog photos
CREATE POLICY "Users can view dog photos" ON storage.objects FOR SELECT USING (bucket_id = 'dog-photos');

CREATE POLICY "Users can upload dog photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'dog-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their dog photos" ON storage.objects FOR UPDATE USING (
  bucket_id = 'dog-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their dog photos" ON storage.objects FOR DELETE USING (
  bucket_id = 'dog-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update dogs table: replace age with birthday
ALTER TABLE dogs DROP COLUMN age;
ALTER TABLE dogs ADD COLUMN birthday DATE;