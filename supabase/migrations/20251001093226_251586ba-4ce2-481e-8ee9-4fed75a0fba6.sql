-- Create grooming_schedules table
CREATE TABLE public.grooming_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  grooming_type TEXT NOT NULL, -- 'full_grooming', 'teeth_brushing', 'nail_trimming', 'ear_cleaning'
  frequency_days INTEGER NOT NULL DEFAULT 7,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  next_due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create health_checkups table
CREATE TABLE public.health_checkups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  checkup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  body_condition_score INTEGER, -- 1-9 scale
  lumps_found BOOLEAN DEFAULT false,
  lump_notes TEXT,
  ear_condition TEXT, -- 'normal', 'red', 'discharge', 'odor'
  ear_notes TEXT,
  eye_condition TEXT, -- 'normal', 'discharge', 'redness', 'cloudiness'
  eye_notes TEXT,
  skin_condition TEXT, -- 'normal', 'dry', 'irritated', 'rash'
  skin_notes TEXT,
  behavior_changes TEXT,
  overall_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.grooming_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checkups ENABLE ROW LEVEL SECURITY;

-- RLS policies for grooming_schedules
CREATE POLICY "Users can view grooming schedules for their dogs"
ON public.grooming_schedules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = grooming_schedules.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert grooming schedules for their dogs"
ON public.grooming_schedules
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = grooming_schedules.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update grooming schedules for their dogs"
ON public.grooming_schedules
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = grooming_schedules.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete grooming schedules for their dogs"
ON public.grooming_schedules
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = grooming_schedules.dog_id
    AND dogs.user_id = auth.uid()
  )
);

-- RLS policies for health_checkups
CREATE POLICY "Users can view health checkups for their dogs"
ON public.health_checkups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = health_checkups.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert health checkups for their dogs"
ON public.health_checkups
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = health_checkups.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update health checkups for their dogs"
ON public.health_checkups
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = health_checkups.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete health checkups for their dogs"
ON public.health_checkups
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM dogs
    WHERE dogs.id = health_checkups.dog_id
    AND dogs.user_id = auth.uid()
  )
);

-- Add trigger for updated_at on grooming_schedules
CREATE TRIGGER update_grooming_schedules_updated_at
BEFORE UPDATE ON public.grooming_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on health_checkups
CREATE TRIGGER update_health_checkups_updated_at
BEFORE UPDATE ON public.health_checkups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();