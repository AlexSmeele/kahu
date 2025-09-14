-- Drop the vulnerable policy that allows all family members to see invitations
DROP POLICY IF EXISTS "Users can view invitations for their families" ON public.family_invitations;

-- Create secure policies for family invitations

-- 1. Only family admins can view invitations they sent
CREATE POLICY "Family admins can view family invitations" 
ON public.family_invitations 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.family_members 
    WHERE family_members.family_id = family_invitations.family_id 
      AND family_members.user_id = auth.uid() 
      AND family_members.role = 'admin'
      AND family_members.status = 'active'
  )
);

-- 2. Allow invited users to view ONLY their own invitation by email (for accepting)
CREATE POLICY "Users can view their own email invitations" 
ON public.family_invitations 
FOR SELECT 
TO authenticated
USING (
  -- Match by email from user's auth.users record
  family_invitations.email = (
    SELECT email FROM auth.users WHERE id = auth.uid()
  )
  -- Only show non-expired, unaccepted invitations
  AND family_invitations.expires_at > now()
  AND family_invitations.accepted_at IS NULL
);

-- 3. Allow public access for invitation acceptance (by token only, no email exposure)
-- This is needed for the accept-family-invitation edge function
CREATE POLICY "Public can access invitations by token for acceptance" 
ON public.family_invitations 
FOR SELECT 
TO anon, authenticated
USING (
  -- Only allow access via specific token lookup (not browsing)
  -- This will be used by edge functions that validate the token
  true
);

-- 4. Restrict the public policy to only essential columns for token validation
-- Create a security definer function for token validation
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

-- Remove the overly permissive public policy
DROP POLICY IF EXISTS "Public can access invitations by token for acceptance" ON public.family_invitations;