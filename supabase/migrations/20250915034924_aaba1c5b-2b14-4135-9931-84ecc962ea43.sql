-- Create a function to get vet clinic information with appropriate access control
CREATE OR REPLACE FUNCTION public.get_accessible_vet_clinics(
  search_query text DEFAULT NULL,
  include_contact_info boolean DEFAULT false
)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  phone text,
  email text,
  website text,
  latitude numeric,
  longitude numeric,
  osm_place_id text,
  osm_type text,
  services text[],
  hours jsonb,
  verified boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  has_contact_access boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_accessible_vet_clinics(text, boolean) TO authenticated;

-- Update RLS policy to be more restrictive for direct table access
DROP POLICY IF EXISTS "Authenticated users can view vet clinics" ON vet_clinics;

-- New restrictive policy - only allow access to clinics associated with user's dogs
CREATE POLICY "Users can view vet clinics for their dogs" ON vet_clinics
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

-- Allow system/service role to access all clinics (for search functionality)
CREATE POLICY "Service role can access all vet clinics" ON vet_clinics
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);