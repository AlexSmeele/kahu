-- Update dog_breeds table to accommodate new comprehensive breed data
-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS public.dog_breeds CASCADE;

CREATE TABLE public.dog_breeds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  breed TEXT NOT NULL UNIQUE,
  origin TEXT,
  life_span_years TEXT,
  
  -- Weight data structure (keeping existing JSON structure but with new fields)
  weight_kg JSONB,
  
  -- Basic characteristics  
  temperament JSONB,
  exercise_needs TEXT,
  trainability TEXT,
  coat TEXT,
  grooming TEXT,
  common_health_issues JSONB,
  
  -- Registration and classification
  recognized_by TEXT,
  also_known_as TEXT,
  fci_group NUMERIC,
  
  -- Exercise and grooming levels
  exercise_level TEXT,
  grooming_needs TEXT,
  
  -- Confidence ratings
  enrichment_confidence TEXT,
  weights_confidence TEXT,
  health_notes_confidence TEXT,
  
  -- Health screening and monitoring
  recommended_screenings TEXT,
  health_watchlist_tags TEXT,
  health_prevalence_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dog_breeds ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to view breed data
CREATE POLICY "Authenticated users can view dog breeds" 
ON public.dog_breeds 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_dog_breeds_updated_at
BEFORE UPDATE ON public.dog_breeds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();