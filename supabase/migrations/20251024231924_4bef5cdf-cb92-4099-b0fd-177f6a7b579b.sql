-- Allow unauthenticated users to view dog breeds for onboarding
DROP POLICY IF EXISTS "Authenticated users can view dog breeds" ON public.dog_breeds;

CREATE POLICY "Anyone can view dog breeds"
ON public.dog_breeds
FOR SELECT
USING (true);

-- Keep the authenticated insert policy for custom breeds
-- (existing policy "Authenticated users can add custom breeds to dog_breeds" remains unchanged)