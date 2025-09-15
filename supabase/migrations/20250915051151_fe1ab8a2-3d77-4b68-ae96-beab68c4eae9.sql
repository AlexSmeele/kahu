-- Create dog breeds encyclopedia table
CREATE TABLE public.dog_breeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  breed TEXT NOT NULL UNIQUE,
  origin TEXT,
  life_span_years TEXT,
  temperament JSONB, -- array of temperament traits
  exercise_needs TEXT,
  trainability TEXT,
  coat TEXT,
  grooming TEXT,
  common_health_issues JSONB, -- array of health issues
  registries JSONB, -- array of registry names
  weight_kg JSONB, -- nested male/female weight ranges
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dog_breeds ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read breed data
CREATE POLICY "Authenticated users can view dog breeds" 
ON public.dog_breeds 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create index for fast breed lookups
CREATE INDEX idx_dog_breeds_breed ON public.dog_breeds(breed);

-- Add trigger for updated_at
CREATE TRIGGER update_dog_breeds_updated_at
BEFORE UPDATE ON public.dog_breeds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();