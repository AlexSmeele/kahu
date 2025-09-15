-- Move pg_trgm extension to extensions schema for better security
DROP EXTENSION IF EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Create secure wrapper functions for trigram operations
CREATE OR REPLACE FUNCTION public.secure_similarity(text, text)
RETURNS real
LANGUAGE SQL
IMMUTABLE
SECURITY DEFINER
SET search_path = extensions, pg_temp
AS $$
  SELECT extensions.similarity($1, $2);
$$;

-- Add additional security constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_phone_format 
CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_domain_check 
CHECK (id IN (SELECT id FROM auth.users));

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