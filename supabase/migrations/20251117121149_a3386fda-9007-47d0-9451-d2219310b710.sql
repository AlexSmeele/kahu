-- Add RLS policies for skills table
-- Skills are reference data that should be viewable by everyone

-- Allow everyone to view skills
CREATE POLICY "Anyone can view skills"
ON skills
FOR SELECT
TO public
USING (true);

-- Only service role can modify skills (via edge functions)
-- No INSERT/UPDATE/DELETE policies for regular users needed