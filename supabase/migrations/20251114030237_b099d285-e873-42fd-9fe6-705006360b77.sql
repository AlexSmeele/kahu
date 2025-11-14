-- Add Google Maps specific columns to vet_clinics table
ALTER TABLE vet_clinics 
ADD COLUMN IF NOT EXISTS google_place_id TEXT,
ADD COLUMN IF NOT EXISTS google_types TEXT[],
ADD COLUMN IF NOT EXISTS rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS user_ratings_total INTEGER,
ADD COLUMN IF NOT EXISTS opening_hours TEXT,
ADD COLUMN IF NOT EXISTS business_status TEXT;

-- Create index for faster lookups by Google Place ID
CREATE INDEX IF NOT EXISTS idx_vet_clinics_google_place_id 
ON vet_clinics(google_place_id) WHERE google_place_id IS NOT NULL;

-- Drop old OSM columns if they exist
ALTER TABLE vet_clinics 
DROP COLUMN IF EXISTS osm_place_id,
DROP COLUMN IF EXISTS osm_type;

-- Add constraint to ensure rating is between 0 and 5
ALTER TABLE vet_clinics 
ADD CONSTRAINT rating_range CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));