-- Create weight_records table for tracking dog weight history
CREATE TABLE public.weight_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  weight NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;

-- Create policies for weight records
CREATE POLICY "Users can view weight records for their dogs" 
ON public.weight_records 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = weight_records.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can insert weight records for their dogs" 
ON public.weight_records 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = weight_records.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can update weight records for their dogs" 
ON public.weight_records 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = weight_records.dog_id 
  AND dogs.user_id = auth.uid()
));

CREATE POLICY "Users can delete weight records for their dogs" 
ON public.weight_records 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = weight_records.dog_id 
  AND dogs.user_id = auth.uid()
));

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_weight_records_updated_at
BEFORE UPDATE ON public.weight_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();