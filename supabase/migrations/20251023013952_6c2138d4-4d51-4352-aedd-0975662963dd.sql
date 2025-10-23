-- Create medical_treatments table for tracking recurring treatments like cytopoint
CREATE TABLE IF NOT EXISTS public.medical_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL,
  treatment_name TEXT NOT NULL,
  last_administered_date TIMESTAMP WITH TIME ZONE NOT NULL,
  frequency_weeks INTEGER NOT NULL,
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.medical_treatments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical_treatments
CREATE POLICY "Users can view medical treatments for their dogs"
  ON public.medical_treatments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dogs
      WHERE dogs.id = medical_treatments.dog_id
      AND dogs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert medical treatments for their dogs"
  ON public.medical_treatments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dogs
      WHERE dogs.id = medical_treatments.dog_id
      AND dogs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update medical treatments for their dogs"
  ON public.medical_treatments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.dogs
      WHERE dogs.id = medical_treatments.dog_id
      AND dogs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete medical treatments for their dogs"
  ON public.medical_treatments
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.dogs
      WHERE dogs.id = medical_treatments.dog_id
      AND dogs.user_id = auth.uid()
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_medical_treatments_updated_at
  BEFORE UPDATE ON public.medical_treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Suki's cytopoint treatment record (10 weeks ago)
-- Note: This will be inserted for the demo user's dog named Suki
INSERT INTO public.medical_treatments (dog_id, treatment_name, last_administered_date, frequency_weeks, next_due_date, notes)
SELECT 
  d.id,
  'Cytopoint Injection',
  now() - INTERVAL '10 weeks',
  8,
  (now() - INTERVAL '10 weeks' + INTERVAL '8 weeks')::date,
  'Allergy treatment - administered every 8 weeks'
FROM public.dogs d
WHERE d.name = 'Suki'
LIMIT 1;