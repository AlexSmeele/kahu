-- Add breed_id column to dogs table and create foreign key relationship
ALTER TABLE public.dogs 
ADD COLUMN breed_id UUID REFERENCES public.dog_breeds(id);

-- Create index for better performance
CREATE INDEX idx_dogs_breed_id ON public.dogs(breed_id);

-- Update existing dogs to link them with breed records
-- This will match existing breed text with dog_breeds table entries
UPDATE public.dogs 
SET breed_id = db.id 
FROM public.dog_breeds db 
WHERE LOWER(TRIM(dogs.breed)) = LOWER(TRIM(db.breed));

-- For any dogs that don't have a matching breed, we'll insert custom breeds
-- First, get unique breeds from dogs table that don't match existing dog_breeds
INSERT INTO public.dog_breeds (breed)
SELECT DISTINCT TRIM(dogs.breed) as breed
FROM public.dogs
WHERE dogs.breed IS NOT NULL 
  AND TRIM(dogs.breed) != ''
  AND dogs.breed_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.dog_breeds db 
    WHERE LOWER(TRIM(db.breed)) = LOWER(TRIM(dogs.breed))
  );

-- Now update the remaining dogs with their custom breed IDs
UPDATE public.dogs 
SET breed_id = db.id 
FROM public.dog_breeds db 
WHERE LOWER(TRIM(dogs.breed)) = LOWER(TRIM(db.breed))
  AND dogs.breed_id IS NULL;

-- Make breed_id NOT NULL and drop the old breed column
ALTER TABLE public.dogs 
ALTER COLUMN breed_id SET NOT NULL;

-- Drop the old breed text column
ALTER TABLE public.dogs 
DROP COLUMN breed;