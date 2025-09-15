-- Fix critical security vulnerabilities in RLS policies
-- This migration addresses publicly readable tables containing sensitive user data

-- 1. PROFILES TABLE - Strengthen existing RLS policies
-- The profiles table currently has RLS policies but they may have gaps
-- Let's ensure comprehensive protection for all operations

-- Drop existing policies and recreate them with explicit restrictions
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

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

-- 2. FAMILY_INVITATIONS TABLE - Add missing RLS policies
-- This table contains sensitive email addresses and invitation tokens

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "Family admins can send invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Family admins can update invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Family admins can view family invitations" ON public.family_invitations;
DROP POLICY IF EXISTS "Users can view their own email invitations (secure)" ON public.family_invitations;

-- Create secure policies for family invitations
CREATE POLICY "family_invitations_admin_select" ON public.family_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_id = family_invitations.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
        AND fm.status = 'active'
    )
    OR
    -- Users can see invitations sent to their email address
    (
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND expires_at > now()
      AND accepted_at IS NULL
    )
  );

CREATE POLICY "family_invitations_admin_insert" ON public.family_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_id = family_invitations.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
        AND fm.status = 'active'
    )
  );

CREATE POLICY "family_invitations_admin_update" ON public.family_invitations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_id = family_invitations.family_id
        AND fm.user_id = auth.uid()
        AND fm.role = 'admin'
        AND fm.status = 'active'
    )
    OR
    -- Users can accept their own invitations
    (
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND expires_at > now()
    )
  );

-- No DELETE policy - prevent deletion of invitations

-- 3. MESSAGE_REPORTS TABLE - Strengthen existing policies
-- Contains private user messages and conversation context

-- Drop and recreate policies for message reports
DROP POLICY IF EXISTS "Users can insert their own message reports" ON public.message_reports;
DROP POLICY IF EXISTS "Users can update their own message reports" ON public.message_reports;
DROP POLICY IF EXISTS "Users can view their own message reports" ON public.message_reports;

CREATE POLICY "message_reports_user_select" ON public.message_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "message_reports_user_insert" ON public.message_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "message_reports_user_update" ON public.message_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- No DELETE policy for message reports (preserve for audit trail)

-- 4. SAVED_MESSAGES TABLE - Strengthen existing policies
-- Contains private user conversations

DROP POLICY IF EXISTS "Users can view their own saved messages" ON public.saved_messages;
DROP POLICY IF EXISTS "Users can insert their own saved messages" ON public.saved_messages;
DROP POLICY IF EXISTS "Users can update their own saved messages" ON public.saved_messages;
DROP POLICY IF EXISTS "Users can delete their own saved messages" ON public.saved_messages;

CREATE POLICY "saved_messages_user_select" ON public.saved_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "saved_messages_user_insert" ON public.saved_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_messages_user_update" ON public.saved_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_messages_user_delete" ON public.saved_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. VET_SEARCH_ANALYTICS TABLE - Add missing RLS policies
-- Contains user search queries and location data

-- Create comprehensive policies for vet search analytics
CREATE POLICY "vet_search_analytics_user_select" ON public.vet_search_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "vet_search_analytics_user_insert" ON public.vet_search_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- No UPDATE or DELETE policies for analytics (preserve data integrity)

-- Ensure RLS is enabled on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_search_analytics ENABLE ROW LEVEL SECURITY;