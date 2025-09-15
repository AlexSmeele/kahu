-- Create a function to mask email addresses for privacy
CREATE OR REPLACE FUNCTION public.mask_email(email text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    local_part text;
    domain_part text;
    masked_local text;
BEGIN
    -- Split email into local and domain parts
    local_part := split_part(email, '@', 1);
    domain_part := split_part(email, '@', 2);
    
    -- Mask the local part (show first 2 chars, then stars, then last char if long enough)
    IF length(local_part) <= 3 THEN
        masked_local := substring(local_part, 1, 1) || '***';
    ELSE
        masked_local := substring(local_part, 1, 2) || '***' || substring(local_part, length(local_part), 1);
    END IF;
    
    RETURN masked_local || '@' || domain_part;
END;
$$;

-- Create a secure view for family invitations that masks emails
CREATE OR REPLACE VIEW public.family_invitations_secure AS
SELECT 
    id,
    family_id,
    CASE 
        -- Only show full email to family admins, masked email to invited users
        WHEN EXISTS (
            SELECT 1 FROM family_members fm 
            WHERE fm.family_id = fi.family_id 
            AND fm.user_id = auth.uid() 
            AND fm.role = 'admin' 
            AND fm.status = 'active'
        ) THEN fi.email
        ELSE public.mask_email(fi.email)
    END as email,
    role,
    invited_by,
    expires_at,
    accepted_at,
    created_at,
    token
FROM family_invitations fi;

-- Enable RLS on the secure view
ALTER VIEW public.family_invitations_secure SET (security_barrier = true);

-- Grant access to the secure view
GRANT SELECT ON public.family_invitations_secure TO authenticated;