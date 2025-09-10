-- Create activity tracking tables for dogs

-- Daily activity goals based on dog characteristics
CREATE TABLE public.activity_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  target_minutes INTEGER NOT NULL DEFAULT 60,
  target_distance_km NUMERIC(5,2) DEFAULT 0,
  activity_level TEXT NOT NULL DEFAULT 'moderate', -- low, moderate, high
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Individual activity records
CREATE TABLE public.activity_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- walk, run, play, training, rest
  duration_minutes INTEGER,
  distance_km NUMERIC(5,2),
  calories_burned INTEGER,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  tracking_method TEXT DEFAULT 'manual', -- manual, gps, accelerometer
  gps_data JSONB, -- Store GPS coordinates if available
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.activity_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for activity_goals
CREATE POLICY "Users can view activity goals for their dogs"
ON public.activity_goals
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM dogs
  WHERE dogs.id = activity_goals.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can insert activity goals for their dogs"
ON public.activity_goals
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM dogs
  WHERE dogs.id = activity_goals.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can update activity goals for their dogs"
ON public.activity_goals
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM dogs
  WHERE dogs.id = activity_goals.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can delete activity goals for their dogs"
ON public.activity_goals
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM dogs
  WHERE dogs.id = activity_goals.dog_id 
  AND dogs.user_id = auth.uid()
));

-- RLS policies for activity_records
CREATE POLICY "Users can view activity records for their dogs"
ON public.activity_records
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM dogs
  WHERE dogs.id = activity_records.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can insert activity records for their dogs"
ON public.activity_records
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM dogs
  WHERE dogs.id = activity_records.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can update activity records for their dogs"
ON public.activity_records
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM dogs
  WHERE dogs.id = activity_records.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can delete activity records for their dogs"
ON public.activity_records
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM dogs
  WHERE dogs.id = activity_records.dog_id 
  AND dogs.user_id = auth.uid()
));

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_activity_goals_updated_at
  BEFORE UPDATE ON public.activity_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_records_updated_at
  BEFORE UPDATE ON public.activity_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();