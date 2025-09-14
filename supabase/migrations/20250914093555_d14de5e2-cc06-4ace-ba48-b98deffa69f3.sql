-- Create table for meal completion tracking
CREATE TABLE public.meal_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  nutrition_plan_id UUID NOT NULL,
  meal_time TIME NOT NULL,
  meal_name TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  amount_given NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meal_records ENABLE ROW LEVEL SECURITY;

-- Create policies for meal records
CREATE POLICY "Users can view meal records for their dogs" 
ON public.meal_records 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = meal_records.dog_id AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can insert meal records for their dogs" 
ON public.meal_records 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = meal_records.dog_id AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can update meal records for their dogs" 
ON public.meal_records 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = meal_records.dog_id AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can delete meal records for their dogs" 
ON public.meal_records 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = meal_records.dog_id AND dogs.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_meal_records_updated_at
BEFORE UPDATE ON public.meal_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add storage bucket for health record attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('health-records', 'health-records', false)
ON CONFLICT (id) DO NOTHING;