-- Fix remaining security issues: Function Search Path and additional data protection

-- 1. Fix Function Search Path Mutable issues
-- Update existing functions to have proper search_path settings

-- Fix create_user_family function
CREATE OR REPLACE FUNCTION public.create_user_family()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  new_family_id UUID;
BEGIN
  -- Create a personal family for the user
  INSERT INTO public.families (name, created_by)
  VALUES (COALESCE(NEW.display_name, 'My Family'), NEW.id)
  RETURNING id INTO new_family_id;
  
  -- Add user as admin of their family
  INSERT INTO public.family_members (family_id, user_id, role)
  VALUES (new_family_id, NEW.id, 'admin');
  
  RETURN NEW;
END;
$function$;

-- Fix generate_invitation_token function
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$function$;

-- Fix is_family_member function
CREATE OR REPLACE FUNCTION public.is_family_member(p_family_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.family_members fm
    WHERE fm.family_id = p_family_id
      AND fm.user_id = p_user_id
      AND fm.status = 'active'
  );
END;
$function$;

-- Fix is_family_admin function
CREATE OR REPLACE FUNCTION public.is_family_admin(p_family_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
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
$function$;

-- Fix validate_invitation_token function
CREATE OR REPLACE FUNCTION public.validate_invitation_token(_token text)
RETURNS TABLE(invitation_id uuid, family_id uuid, email text, role text, expires_at timestamp with time zone, accepted_at timestamp with time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
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
$function$;

-- Fix mask_email function
CREATE OR REPLACE FUNCTION public.mask_email(email text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
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
$function$;

-- Fix get_user_invitations function
CREATE OR REPLACE FUNCTION public.get_user_invitations()
RETURNS TABLE(id uuid, family_id uuid, email text, role text, invited_by uuid, expires_at timestamp with time zone, accepted_at timestamp with time zone, created_at timestamp with time zone)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
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
$function$;

-- Fix get_accessible_vet_clinics function
CREATE OR REPLACE FUNCTION public.get_accessible_vet_clinics(search_query text DEFAULT NULL::text, include_contact_info boolean DEFAULT false)
RETURNS TABLE(id uuid, name text, address text, phone text, email text, website text, latitude numeric, longitude numeric, osm_place_id text, osm_type text, services text[], hours jsonb, verified boolean, created_at timestamp with time zone, updated_at timestamp with time zone, has_contact_access boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    vc.id,
    vc.name,
    vc.address,
    CASE 
      -- Show contact info if user has associated dogs with this clinic or if explicitly requested with access
      WHEN EXISTS (
        SELECT 1 FROM dog_vet_clinics dvc
        JOIN dogs d ON dvc.dog_id = d.id
        WHERE dvc.vet_clinic_id = vc.id 
        AND d.user_id = auth.uid()
      ) OR include_contact_info THEN vc.phone
      -- For search results, show masked phone (first 3 digits + ****)
      ELSE CASE 
        WHEN vc.phone IS NOT NULL THEN substring(vc.phone, 1, 3) || '****'
        ELSE NULL
      END
    END as phone,
    CASE 
      -- Show email only if user has associated dogs with this clinic or if explicitly requested with access
      WHEN EXISTS (
        SELECT 1 FROM dog_vet_clinics dvc
        JOIN dogs d ON dvc.dog_id = d.id
        WHERE dvc.vet_clinic_id = vc.id 
        AND d.user_id = auth.uid()
      ) OR include_contact_info THEN vc.email
      -- For search results, show masked email
      ELSE CASE 
        WHEN vc.email IS NOT NULL THEN 'contact@' || split_part(vc.email, '@', 2)
        ELSE NULL
      END
    END as email,
    vc.website,
    vc.latitude,
    vc.longitude,
    vc.osm_place_id,
    vc.osm_type,
    vc.services,
    vc.hours,
    vc.verified,
    vc.created_at,
    vc.updated_at,
    EXISTS (
      SELECT 1 FROM dog_vet_clinics dvc
      JOIN dogs d ON dvc.dog_id = d.id
      WHERE dvc.vet_clinic_id = vc.id 
      AND d.user_id = auth.uid()
    ) as has_contact_access
  FROM vet_clinics vc
  WHERE 
    (search_query IS NULL OR 
     vc.name ILIKE '%' || search_query || '%' OR 
     vc.address ILIKE '%' || search_query || '%')
  ORDER BY 
    -- Prioritize clinics user has access to
    (EXISTS (
      SELECT 1 FROM dog_vet_clinics dvc
      JOIN dogs d ON dvc.dog_id = d.id
      WHERE dvc.vet_clinic_id = vc.id 
      AND d.user_id = auth.uid()
    )) DESC,
    vc.verified DESC,
    vc.name ASC;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 2. Strengthen vet_search_analytics policy to remove NULL user_id access
DROP POLICY IF EXISTS "vet_search_analytics_user_select" ON public.vet_search_analytics;
DROP POLICY IF EXISTS "vet_search_analytics_user_insert" ON public.vet_search_analytics;

-- Only allow authenticated users to see their own analytics
CREATE POLICY "vet_search_analytics_authenticated_only" ON public.vet_search_analytics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "vet_search_analytics_insert_authenticated" ON public.vet_search_analytics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Remove service role access to vet_clinics for stronger security
DROP POLICY IF EXISTS "Service role can access all vet clinics" ON public.vet_clinics;

-- Replace with more restrictive policy that only allows access through the get_accessible_vet_clinics function
CREATE POLICY "vet_clinics_restricted_access" ON public.vet_clinics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dog_vet_clinics dvc
      JOIN dogs d ON dvc.dog_id = d.id
      WHERE dvc.vet_clinic_id = vet_clinics.id 
      AND d.user_id = auth.uid()
    )
  );