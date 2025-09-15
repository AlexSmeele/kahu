-- Create a function to get secure invitation data with masked emails (if not exists)
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