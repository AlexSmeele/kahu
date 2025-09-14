-- First, let's see all current policies on family_invitations
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check 
FROM pg_policies 
WHERE tablename = 'family_invitations';