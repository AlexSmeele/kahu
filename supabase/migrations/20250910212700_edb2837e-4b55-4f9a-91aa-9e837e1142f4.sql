-- Create vet_clinics table for storing clinic information
CREATE TABLE public.vet_clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  osm_place_id TEXT UNIQUE,
  osm_type TEXT,
  hours JSONB,
  services TEXT[],
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dog_vet_clinics junction table for user's preferred clinics
CREATE TABLE public.dog_vet_clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  vet_clinic_id UUID NOT NULL REFERENCES public.vet_clinics(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  relationship_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dog_id, vet_clinic_id)
);

-- Add vet_clinic_id to health_records for linking records to clinics
ALTER TABLE public.health_records 
ADD COLUMN vet_clinic_id UUID REFERENCES public.vet_clinics(id);

-- Add vet_clinic_id to vaccination_records for linking records to clinics  
ALTER TABLE public.vaccination_records
ADD COLUMN vet_clinic_id UUID REFERENCES public.vet_clinics(id);

-- Enable Row Level Security
ALTER TABLE public.vet_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dog_vet_clinics ENABLE ROW LEVEL SECURITY;

-- RLS policies for vet_clinics (public read, no user writes to maintain data integrity)
CREATE POLICY "Anyone can view vet clinics" 
ON public.vet_clinics 
FOR SELECT 
USING (true);

-- RLS policies for dog_vet_clinics (users can manage their dogs' clinic relationships)
CREATE POLICY "Users can view vet clinics for their dogs" 
ON public.dog_vet_clinics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = dog_vet_clinics.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can insert vet clinic relationships for their dogs" 
ON public.dog_vet_clinics 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = dog_vet_clinics.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can update vet clinic relationships for their dogs" 
ON public.dog_vet_clinics 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = dog_vet_clinics.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can delete vet clinic relationships for their dogs" 
ON public.dog_vet_clinics 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = dog_vet_clinics.dog_id 
  AND dogs.user_id = auth.uid()
));

-- Create indexes for better performance
CREATE INDEX idx_vet_clinics_osm_place_id ON public.vet_clinics(osm_place_id);
CREATE INDEX idx_vet_clinics_location ON public.vet_clinics(latitude, longitude);
CREATE INDEX idx_dog_vet_clinics_dog_id ON public.dog_vet_clinics(dog_id);
CREATE INDEX idx_health_records_vet_clinic_id ON public.health_records(vet_clinic_id);
CREATE INDEX idx_vaccination_records_vet_clinic_id ON public.vaccination_records(vet_clinic_id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_vet_clinics_updated_at
BEFORE UPDATE ON public.vet_clinics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dog_vet_clinics_updated_at
BEFORE UPDATE ON public.dog_vet_clinics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();