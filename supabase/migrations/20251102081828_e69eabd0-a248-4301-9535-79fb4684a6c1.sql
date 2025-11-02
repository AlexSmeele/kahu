-- Make breed_id nullable to support custom-breed-only dogs
ALTER TABLE dogs 
ALTER COLUMN breed_id DROP NOT NULL;

-- Add a constraint to ensure at least one breed type is specified
ALTER TABLE dogs
ADD CONSTRAINT dogs_breed_check 
CHECK (breed_id IS NOT NULL OR custom_breed_id IS NOT NULL);