-- Create groomers table
CREATE TABLE public.groomers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  website TEXT,
  services TEXT[],
  specialties TEXT[],
  latitude NUMERIC,
  longitude NUMERIC,
  google_place_id TEXT,
  rating NUMERIC,
  user_ratings_total INTEGER,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create dog_groomers junction table
CREATE TABLE public.dog_groomers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  groomer_id UUID REFERENCES groomers(id) ON DELETE CASCADE NOT NULL,
  is_preferred BOOLEAN DEFAULT false,
  relationship_notes TEXT,
  preferred_groomer_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dog_id, groomer_id)
);

-- Create dog_walkers table
CREATE TABLE public.dog_walkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  services TEXT[],
  availability TEXT,
  service_area TEXT,
  rating NUMERIC,
  user_ratings_total INTEGER,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create dog_dog_walkers junction table
CREATE TABLE public.dog_dog_walkers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID REFERENCES dogs(id) ON DELETE CASCADE NOT NULL,
  walker_id UUID REFERENCES dog_walkers(id) ON DELETE CASCADE NOT NULL,
  is_preferred BOOLEAN DEFAULT false,
  relationship_notes TEXT,
  preferred_days TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dog_id, walker_id)
);

-- Enable RLS
ALTER TABLE groomers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_groomers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_walkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dog_dog_walkers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groomers
CREATE POLICY "Anyone can view groomers"
ON public.groomers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can add groomers"
ON public.groomers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for dog_groomers
CREATE POLICY "Users can view groomers for their dogs"
ON public.dog_groomers
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM dogs WHERE dogs.id = dog_groomers.dog_id AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can add groomers for their dogs"
ON public.dog_groomers
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM dogs WHERE dogs.id = dog_groomers.dog_id AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can update groomers for their dogs"
ON public.dog_groomers
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM dogs WHERE dogs.id = dog_groomers.dog_id AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can delete groomers for their dogs"
ON public.dog_groomers
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM dogs WHERE dogs.id = dog_groomers.dog_id AND dogs.user_id = auth.uid()
));

-- RLS Policies for dog_walkers
CREATE POLICY "Anyone can view dog walkers"
ON public.dog_walkers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can add dog walkers"
ON public.dog_walkers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for dog_dog_walkers
CREATE POLICY "Users can view walkers for their dogs"
ON public.dog_dog_walkers
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM dogs WHERE dogs.id = dog_dog_walkers.dog_id AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can add walkers for their dogs"
ON public.dog_dog_walkers
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM dogs WHERE dogs.id = dog_dog_walkers.dog_id AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can update walkers for their dogs"
ON public.dog_dog_walkers
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM dogs WHERE dogs.id = dog_dog_walkers.dog_id AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can delete walkers for their dogs"
ON public.dog_dog_walkers
FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM dogs WHERE dogs.id = dog_dog_walkers.dog_id AND dogs.user_id = auth.uid()
));

-- Add updated_at triggers
CREATE TRIGGER update_groomers_updated_at
  BEFORE UPDATE ON public.groomers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dog_groomers_updated_at
  BEFORE UPDATE ON public.dog_groomers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dog_walkers_updated_at
  BEFORE UPDATE ON public.dog_walkers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dog_dog_walkers_updated_at
  BEFORE UPDATE ON public.dog_dog_walkers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();