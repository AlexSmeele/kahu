-- Remove public access policies from all three tables
DROP POLICY IF EXISTS "Anyone can view tricks" ON public.tricks;
DROP POLICY IF EXISTS "Anyone can view vaccines reference data" ON public.vaccines;
DROP POLICY IF EXISTS "Anyone can view vet clinics" ON public.vet_clinics;

-- Create new authenticated-only access policies
CREATE POLICY "Authenticated users can view tricks" 
ON public.tricks 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view vaccines" 
ON public.vaccines 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view vet clinics" 
ON public.vet_clinics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);