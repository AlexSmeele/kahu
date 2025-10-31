-- Create grooming_completions table to track each grooming completion
CREATE TABLE public.grooming_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.grooming_schedules(id) ON DELETE CASCADE,
  dog_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  photos TEXT[], -- Array of storage URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grooming_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for grooming_completions
CREATE POLICY "Users can view grooming completions for their dogs"
ON public.grooming_completions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = grooming_completions.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert grooming completions for their dogs"
ON public.grooming_completions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = grooming_completions.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update grooming completions for their dogs"
ON public.grooming_completions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = grooming_completions.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete grooming completions for their dogs"
ON public.grooming_completions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = grooming_completions.dog_id
    AND dogs.user_id = auth.uid()
  )
);

-- Create index for better query performance
CREATE INDEX idx_grooming_completions_schedule ON public.grooming_completions(schedule_id);
CREATE INDEX idx_grooming_completions_dog ON public.grooming_completions(dog_id);

-- Create storage bucket for grooming photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('grooming-photos', 'grooming-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for grooming photos
CREATE POLICY "Users can view grooming photos for their dogs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'grooming-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload grooming photos for their dogs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'grooming-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update grooming photos for their dogs"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'grooming-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete grooming photos for their dogs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'grooming-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);