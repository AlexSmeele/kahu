-- Skip the phone constraint for now and focus on other security improvements
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

-- Add rate limiting for sensitive operations
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  operation_name text,
  max_attempts integer DEFAULT 5,
  time_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  current_attempts integer;
BEGIN
  -- This is a simplified rate limiting check
  -- In production, you'd use a more robust rate limiting system
  
  SELECT COUNT(*)
  INTO current_attempts
  FROM audit_logs
  WHERE user_id = auth.uid()
    AND action = operation_name
    AND created_at > now() - (time_window_minutes || ' minutes')::interval;
    
  RETURN current_attempts < max_attempts;
END;
$$;

-- Add additional security for vet search
CREATE OR REPLACE FUNCTION public.secure_vet_search(search_term text)
RETURNS SETOF vet_clinics
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT *
  FROM vet_clinics
  WHERE name ILIKE '%' || search_term || '%'
     OR address ILIKE '%' || search_term || '%'
  ORDER BY verified DESC, name ASC
  LIMIT 50;
$$;