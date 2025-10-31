-- Create treat_logs table for tracking treats given to dogs
CREATE TABLE public.treat_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_id UUID NOT NULL,
  nutrition_plan_id UUID REFERENCES public.nutrition_plans(id) ON DELETE SET NULL,
  treat_type TEXT NOT NULL,
  treat_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'piece',
  calories INTEGER,
  given_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  given_by UUID,
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.treat_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view treat logs for their dogs"
ON public.treat_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dogs
    WHERE dogs.id = treat_logs.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert treat logs for their dogs"
ON public.treat_logs
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dogs
    WHERE dogs.id = treat_logs.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update treat logs for their dogs"
ON public.treat_logs
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.dogs
    WHERE dogs.id = treat_logs.dog_id
    AND dogs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete treat logs for their dogs"
ON public.treat_logs
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.dogs
    WHERE dogs.id = treat_logs.dog_id
    AND dogs.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_treat_logs_dog_id ON public.treat_logs(dog_id);
CREATE INDEX idx_treat_logs_given_at ON public.treat_logs(given_at);
CREATE INDEX idx_treat_logs_dog_given_at ON public.treat_logs(dog_id, given_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_treat_logs_updated_at
BEFORE UPDATE ON public.treat_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();