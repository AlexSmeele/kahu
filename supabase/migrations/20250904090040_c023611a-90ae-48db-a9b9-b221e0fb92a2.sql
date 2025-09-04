-- Add development policy for mock users
CREATE POLICY "Allow mock user operations for development" 
ON public.dogs 
FOR ALL 
USING (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
WITH CHECK (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid);