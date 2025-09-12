-- Enable required extensions for geospatial and text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add indexes for performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_vet_clinics_osm_place_id ON vet_clinics(osm_place_id) WHERE osm_place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vet_clinics_name_trgm ON vet_clinics USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vet_clinics_address_trgm ON vet_clinics USING gin(address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_vet_clinics_location ON vet_clinics USING gist(ll_to_earth(latitude, longitude)) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

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

-- Create policy for analytics (admin only for now)
CREATE POLICY "Only authenticated users can view search analytics" 
ON public.vet_search_analytics 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add trigger for updated_at on analytics
CREATE TRIGGER update_vet_search_analytics_updated_at
BEFORE UPDATE ON public.vet_search_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();