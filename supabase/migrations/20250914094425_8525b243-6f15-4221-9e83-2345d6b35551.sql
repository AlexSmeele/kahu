-- Helper functions to avoid RLS recursion when checking family membership
CREATE OR REPLACE FUNCTION public.is_family_member(p_family_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.family_members fm
    WHERE fm.family_id = p_family_id
      AND fm.user_id = p_user_id
      AND fm.status = 'active'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_family_admin(p_family_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.family_members fm
    WHERE fm.family_id = p_family_id
      AND fm.user_id = p_user_id
      AND fm.role = 'admin'
      AND fm.status = 'active'
  );
END;
$$;

-- FAMILY MEMBERS: replace recursive policies
DROP POLICY IF EXISTS "Family admins can manage members" ON public.family_members;
DROP POLICY IF EXISTS "Family admins can remove members" ON public.family_members;
DROP POLICY IF EXISTS "Users can join families via invitation" ON public.family_members;
DROP POLICY IF EXISTS "Users can view family members of their families" ON public.family_members;

-- Insert: user can insert their own membership (invitation flow)
CREATE POLICY "Users can join families via invitation"
ON public.family_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Select: user can see own membership and all members of families they belong to
CREATE POLICY "Users can view family members of their families"
ON public.family_members
FOR SELECT
USING (
  user_id = auth.uid() OR is_family_member(family_id, auth.uid())
);

-- Update: only family admins can update any member row in their family
CREATE POLICY "Family admins can manage members"
ON public.family_members
FOR UPDATE
USING (is_family_admin(family_id, auth.uid()));

-- Delete: only family admins can delete any member row in their family
CREATE POLICY "Family admins can remove members"
ON public.family_members
FOR DELETE
USING (is_family_admin(family_id, auth.uid()));

-- FAMILIES: replace policies to use helper functions (avoid recursion)
DROP POLICY IF EXISTS "Family admins can update families" ON public.families;
DROP POLICY IF EXISTS "Users can view their families" ON public.families;

CREATE POLICY "Family admins can update families"
ON public.families
FOR UPDATE
USING (is_family_admin(id, auth.uid()));

CREATE POLICY "Users can view their families"
ON public.families
FOR SELECT
USING (is_family_member(id, auth.uid()));

-- DOGS: adjust family policies to use helper functions (avoid recursion via family_members)
DROP POLICY IF EXISTS "Family members can update family dogs" ON public.dogs;
DROP POLICY IF EXISTS "Family members can view family dogs" ON public.dogs;

CREATE POLICY "Family members can view family dogs"
ON public.dogs
FOR SELECT
USING ((family_id IS NOT NULL) AND is_family_member(family_id, auth.uid()));

CREATE POLICY "Family members can update family dogs"
ON public.dogs
FOR UPDATE
USING ((family_id IS NOT NULL) AND is_family_member(family_id, auth.uid()));
