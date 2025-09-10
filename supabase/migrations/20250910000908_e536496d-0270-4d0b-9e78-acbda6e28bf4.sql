-- Create vaccines reference table
CREATE TABLE IF NOT EXISTS public.vaccines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  vaccine_type TEXT NOT NULL, -- 'core', 'lifestyle', 'regional', 'injectable_therapy'
  protects_against TEXT NOT NULL,
  schedule_info TEXT NOT NULL,
  notes TEXT,
  frequency_months INTEGER, -- for recurring vaccines
  puppy_start_weeks INTEGER, -- when puppies can start
  booster_required BOOLEAN DEFAULT false,
  lifestyle_factors TEXT[], -- array of lifestyle factors that make this relevant
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vaccines table
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;

-- Create policy to allow everyone to view vaccines (reference data)
CREATE POLICY "Anyone can view vaccines reference data" 
ON public.vaccines 
FOR SELECT 
USING (true);

-- Create vaccination_records table for individual dog vaccination tracking
CREATE TABLE IF NOT EXISTS public.vaccination_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  vaccine_id UUID NOT NULL REFERENCES public.vaccines(id),
  administered_date DATE NOT NULL,
  due_date DATE,
  veterinarian TEXT,
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on vaccination_records table
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;

-- Create policies for vaccination_records
CREATE POLICY "Users can view vaccination records for their dogs" 
ON public.vaccination_records 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = vaccination_records.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can insert vaccination records for their dogs" 
ON public.vaccination_records 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = vaccination_records.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can update vaccination records for their dogs" 
ON public.vaccination_records 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = vaccination_records.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can delete vaccination records for their dogs" 
ON public.vaccination_records 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = vaccination_records.dog_id 
  AND dogs.user_id = auth.uid()
));

-- Add triggers for updated_at columns
CREATE TRIGGER update_vaccines_updated_at
BEFORE UPDATE ON public.vaccines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vaccination_records_updated_at
BEFORE UPDATE ON public.vaccination_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert vaccine reference data
INSERT INTO public.vaccines (name, vaccine_type, protects_against, schedule_info, notes, frequency_months, puppy_start_weeks, booster_required, lifestyle_factors) VALUES
('Rabies', 'core', 'Rabies virus (fatal, zoonotic)', 'Puppy: ≥12–16 wks; booster at 1 yr; then every 1–3 yrs (per law)', 'Required by law in many countries; protects humans too', 36, 12, true, ARRAY['required_by_law']),
('DHPP/DA2PP', 'core', 'Distemper, parvo, infectious hepatitis, parainfluenza', 'Puppy: 6–8, 10–12, 14–16 wks; booster at 1 yr; then every 1–3 yrs', 'Essential for all dogs', 36, 6, true, ARRAY['essential']),
('Bordetella', 'lifestyle', 'Kennel cough (respiratory disease)', '1 dose after 8 wks; booster every 6–12 months', 'Required by kennels, groomers, daycares', 12, 8, true, ARRAY['boarding', 'grooming', 'daycare', 'social']),
('Leptospirosis', 'lifestyle', 'Leptospira bacteria (kidney/liver disease, zoonotic)', '2 doses, 2–4 wks apart; then yearly', 'Needed if exposure to wildlife, puddles, standing water', 12, 12, true, ARRAY['wildlife_exposure', 'standing_water', 'rural']),
('Lyme Disease', 'lifestyle', 'Tick-borne Lyme disease', 'Puppy: from 12 wks; 2-dose series, then yearly', 'For dogs in tick-heavy areas (US, EU, Asia hotspots)', 12, 12, true, ARRAY['tick_areas', 'hiking', 'wooded_areas']),
('Canine Influenza', 'lifestyle', 'Dog flu (respiratory virus)', '2 doses, 2–4 wks apart; then yearly', 'For social dogs, boarding, or travel to outbreak areas', 12, 12, true, ARRAY['boarding', 'travel', 'social', 'outbreak_areas']),
('Rattlesnake Vaccine', 'regional', 'Reduces venom severity (not full protection)', 'Initial 2-dose series, then yearly booster', 'For dogs in rattlesnake-prone areas (e.g., SW USA)', 12, 16, true, ARRAY['rattlesnake_areas', 'southwest_usa', 'hiking']),
('Cytopoint', 'injectable_therapy', 'Controls allergic itching (atopic dermatitis)', 'Every 4–8 weeks', 'Not a vaccine; relieves itching without steroids', 2, NULL, false, ARRAY['allergies', 'atopic_dermatitis']),
('ProHeart 6', 'injectable_therapy', 'Heartworm disease prevention', 'Every 6 months', 'Alternative to monthly oral preventatives', 6, NULL, false, ARRAY['heartworm_prevention']),
('ProHeart 12', 'injectable_therapy', 'Heartworm disease prevention', 'Every 12 months', 'Alternative to monthly oral preventatives', 12, NULL, false, ARRAY['heartworm_prevention']),
('ASIT (Allergy Shots)', 'injectable_therapy', 'Custom allergy therapy (environmental triggers)', 'Ongoing, long-term', 'Tailored to each dog after allergy testing', NULL, NULL, false, ARRAY['environmental_allergies', 'custom_therapy']);