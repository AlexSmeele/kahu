-- Create dog_notes table for quick health notes
CREATE TABLE IF NOT EXISTS public.dog_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('photo', 'video')),
  note_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dog_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own dog notes"
  ON public.dog_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = dog_notes.dog_id
    AND dogs.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own dog notes"
  ON public.dog_notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = dog_notes.dog_id
    AND dogs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own dog notes"
  ON public.dog_notes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = dog_notes.dog_id
    AND dogs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own dog notes"
  ON public.dog_notes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = dog_notes.dog_id
    AND dogs.user_id = auth.uid()
  ));

-- Add trigger for updated_at
CREATE TRIGGER update_dog_notes_updated_at
  BEFORE UPDATE ON public.dog_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_dog_notes_dog_id ON public.dog_notes(dog_id);
CREATE INDEX idx_dog_notes_note_date ON public.dog_notes(note_date DESC);