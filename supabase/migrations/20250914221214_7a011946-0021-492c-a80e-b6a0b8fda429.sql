-- Create a secure token validation function that only returns essential information
CREATE OR REPLACE FUNCTION public.validate_invitation_token(_token text)
RETURNS TABLE(
  invitation_id uuid,
  family_id uuid,
  email text,
  role text,
  expires_at timestamptz,
  accepted_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    id as invitation_id,
    family_id,
    email,
    role,
    expires_at,
    accepted_at
  FROM public.family_invitations
  WHERE token = _token
    AND expires_at > now()
    AND accepted_at IS NULL
  LIMIT 1;
$$;