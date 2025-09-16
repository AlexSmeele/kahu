-- Update dog_breeds table to match CSV structure exactly

-- Add individual weight columns to match CSV headers
ALTER TABLE dog_breeds 
ADD COLUMN male_weight_adult_kg_min NUMERIC,
ADD COLUMN male_weight_adult_kg_max NUMERIC,
ADD COLUMN male_weight_6m_kg_min NUMERIC,
ADD COLUMN male_weight_6m_kg_max NUMERIC,
ADD COLUMN female_weight_adult_kg_min NUMERIC,
ADD COLUMN female_weight_adult_kg_max NUMERIC,
ADD COLUMN female_weight_6m_kg_min NUMERIC,
ADD COLUMN female_weight_6m_kg_max NUMERIC;

-- Drop the existing JSONB weight column since we now have individual columns
ALTER TABLE dog_breeds DROP COLUMN weight_kg;

-- Change temperament and common_health_issues from JSONB to TEXT to match CSV
ALTER TABLE dog_breeds 
ALTER COLUMN temperament TYPE TEXT,
ALTER COLUMN common_health_issues TYPE TEXT;