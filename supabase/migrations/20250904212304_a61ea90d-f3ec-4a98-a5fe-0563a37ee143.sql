-- Add development policy for dog_tricks table to allow mock user operations
CREATE POLICY "Allow mock user operations for development on dog_tricks" 
ON dog_tricks 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM dogs 
  WHERE dogs.id = dog_tricks.dog_id 
  AND dogs.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
))
WITH CHECK (EXISTS ( 
  SELECT 1 FROM dogs 
  WHERE dogs.id = dog_tricks.dog_id 
  AND dogs.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
));