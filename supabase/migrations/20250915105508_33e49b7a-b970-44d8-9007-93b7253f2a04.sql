-- Add triggers for audit logging on sensitive tables
CREATE TRIGGER audit_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_dogs_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.dogs
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_health_records_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.health_records
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Create function to validate password strength
CREATE OR REPLACE FUNCTION public.validate_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Check minimum length
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Check for at least one uppercase letter
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one lowercase letter
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Check for at least one digit
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Add indexes for better performance and security
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_dogs_family_id ON public.dogs(family_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON public.audit_logs(user_id, action, created_at);