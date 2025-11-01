-- Add vet_clinic_id column to medical_treatments table
ALTER TABLE medical_treatments 
ADD COLUMN vet_clinic_id UUID REFERENCES vet_clinics(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_medical_treatments_vet_clinic 
ON medical_treatments(vet_clinic_id);