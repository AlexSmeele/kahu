-- Enable required extensions for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_vet_clinics_osm_place_id ON vet_clinics(osm_place_id) WHERE osm_place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vet_clinics_name_trgm ON vet_clinics USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vet_clinics_address_trgm ON vet_clinics USING gin(address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vet_clinics_lat_lng ON vet_clinics(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create analytics table for search metrics
CREATE TABLE IF NOT EXISTS public.vet_search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  search_query TEXT NOT NULL,
  user_location_provided BOOLEAN DEFAULT false,
  database_results_count INTEGER DEFAULT 0,
  osm_results_count INTEGER DEFAULT 0,
  total_results_count INTEGER DEFAULT 0,
  selected_clinic_id UUID REFERENCES vet_clinics(id),
  error_message TEXT,
  response_time_ms INTEGER,
  user_id UUID
);

-- Enable RLS on analytics table
ALTER TABLE public.vet_search_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for analytics (authenticated users can view their own)
CREATE POLICY "Users can view their own search analytics" 
ON public.vet_search_analytics 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own search analytics" 
ON public.vet_search_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);