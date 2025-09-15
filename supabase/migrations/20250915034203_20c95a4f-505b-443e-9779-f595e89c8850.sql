-- Drop the view since we can't use RLS on views
DROP VIEW IF EXISTS public.family_invitations_secure;

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can view their own email invitations" ON public.family_invitations;

-- Create a new, more secure policy that masks email addresses
CREATE POLICY "Users can view their own email invitations (secure)" 
ON public.family_invitations 
FOR SELECT 
TO authenticated 
USING (
    email = (
        SELECT users.email 
        FROM auth.users 
        WHERE users.id = auth.uid()
    )
    AND expires_at > now() 
    AND accepted_at IS NULL
);

-- Create a function to get secure invitation data with masked emails
CREATE OR REPLACE FUNCTION public.get_user_invitations()
RETURNS TABLE (
    id uuid,
    family_id uuid,
    email text,
    role text,
    invited_by uuid,
    expires_at timestamp with time zone,
    accepted_at timestamp with time zone,
    created_at timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fi.id,
        fi.family_id,
        public.mask_email(fi.email) as email,
        fi.role,
        fi.invited_by,
        fi.expires_at,
        fi.accepted_at,  
        fi.created_at
    FROM family_invitations fi
    WHERE fi.email = (
        SELECT u.email 
        FROM auth.users u 
        WHERE u.id = auth.uid()
    )
    AND fi.expires_at > now()
    AND fi.accepted_at IS NULL;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_invitations() TO authenticated;