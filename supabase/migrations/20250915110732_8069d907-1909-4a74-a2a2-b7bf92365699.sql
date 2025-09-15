-- Fix the constraint syntax
DO $$
BEGIN
    -- Add phone format constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_phone_format' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_phone_format 
        CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');
    END IF;
END $$;

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