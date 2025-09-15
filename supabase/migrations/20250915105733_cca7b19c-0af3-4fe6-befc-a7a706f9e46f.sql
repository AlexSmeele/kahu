-- Drop dependent indexes before moving extension
DROP INDEX IF EXISTS idx_vet_clinics_name_trgm;
DROP INDEX IF EXISTS idx_vet_clinics_address_trgm;

-- Now we can safely move the extension
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Recreate the indexes using the extension schema
CREATE INDEX IF NOT EXISTS idx_vet_clinics_name_trgm 
ON public.vet_clinics USING gin (name extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_vet_clinics_address_trgm 
ON public.vet_clinics USING gin (address extensions.gin_trgm_ops);

-- Add additional security constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT IF NOT EXISTS profiles_phone_format 
CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');

-- Create secure data access function
CREATE OR REPLACE FUNCTION public.get_user_profile_secure()
RETURNS TABLE(
  id uuid,
  display_name text,
  avatar_url text,
  created_at timestamptz
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT p.id, p.display_name, p.avatar_url, p.created_at
  FROM profiles p
  WHERE p.id = auth.uid();
$$;