-- Ensure RLS is explicitly enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with explicit checks
DROP POLICY IF EXISTS "profiles_select_own_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_no_delete" ON public.profiles;

-- Create comprehensive RLS policies that explicitly require authentication
-- and prevent any anonymous access to sensitive personal information

-- SELECT: Users can only view their own profile data
CREATE POLICY "profiles_select_own_only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- INSERT: Users can only create their own profile
CREATE POLICY "profiles_insert_own_only" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- UPDATE: Users can only update their own profile
CREATE POLICY "profiles_update_own_only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- DELETE: No user can delete profiles (managed by auth triggers)
CREATE POLICY "profiles_no_delete" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (false);

-- Block all anonymous access explicitly
CREATE POLICY "profiles_block_anonymous" 
ON public.profiles 
FOR ALL 
TO anon
USING (false);