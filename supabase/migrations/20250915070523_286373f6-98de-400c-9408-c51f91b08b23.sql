-- Fix critical security vulnerabilities in RLS policies (revised)
-- This migration addresses publicly readable tables containing sensitive user data

-- 1. PROFILES TABLE - Replace existing policies with stronger ones
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_select_own_only" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_insert_own_only" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_update_own_only" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_no_delete" ON public.profiles;
    
    -- Create strict RLS policies for profiles table
    CREATE POLICY "profiles_select_own_only" ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);

    CREATE POLICY "profiles_insert_own_only" ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);

    CREATE POLICY "profiles_update_own_only" ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);

    -- Explicitly deny DELETE operations on profiles
    CREATE POLICY "profiles_no_delete" ON public.profiles
      FOR DELETE
      TO authenticated
      USING (false);
END $$;

-- 2. VET_SEARCH_ANALYTICS TABLE - Add missing RLS policies
DO $$
BEGIN
    -- Drop any existing policies first
    DROP POLICY IF EXISTS "Users can insert their own search analytics" ON public.vet_search_analytics;
    DROP POLICY IF EXISTS "Users can view their own search analytics" ON public.vet_search_analytics;
    DROP POLICY IF EXISTS "vet_search_analytics_user_select" ON public.vet_search_analytics;
    DROP POLICY IF EXISTS "vet_search_analytics_user_insert" ON public.vet_search_analytics;
    
    -- Create secure policies for vet search analytics
    CREATE POLICY "vet_search_analytics_user_select" ON public.vet_search_analytics
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR user_id IS NULL);

    CREATE POLICY "vet_search_analytics_user_insert" ON public.vet_search_analytics
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
END $$;

-- Ensure RLS is enabled on all tables that need it
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_search_analytics ENABLE ROW LEVEL SECURITY;