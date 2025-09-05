-- Add mock user policies to weight_records table for development
CREATE POLICY "Allow mock user operations for weight records development" 
ON public.weight_records 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = weight_records.dog_id 
  AND dogs.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
))
WITH CHECK (EXISTS (
  SELECT 1 FROM dogs 
  WHERE dogs.id = weight_records.dog_id 
  AND dogs.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
));