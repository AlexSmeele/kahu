-- Drop the previous security definer view
DROP VIEW IF EXISTS public.family_invitations_secure;

-- Create a regular view without security definer
CREATE VIEW public.family_invitations_secure AS
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

-- Enable RLS on the view
ALTER VIEW public.family_invitations_secure ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the secure view
CREATE POLICY "Family admins can view all family invitations" 
ON public.family_invitations_secure 
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM family_members fm 
        WHERE fm.family_id = family_invitations_secure.family_id 
        AND fm.user_id = auth.uid() 
        AND fm.role = 'admin' 
        AND fm.status = 'active'
    )
);

CREATE POLICY "Users can view their own email invitations (masked)" 
ON public.family_invitations_secure 
FOR SELECT 
TO authenticated 
USING (
    email LIKE '%' || (
        SELECT users.email 
        FROM auth.users 
        WHERE users.id = auth.uid()
    ) || '%'
    AND expires_at > now() 
    AND accepted_at IS NULL
);

-- Grant access to the secure view
GRANT SELECT ON public.family_invitations_secure TO authenticated;