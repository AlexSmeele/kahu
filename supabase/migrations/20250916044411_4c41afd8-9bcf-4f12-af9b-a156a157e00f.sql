-- Update existing dogs to reference a valid breed from dog_breeds table
-- Using the first breed available as a default since we don't know their actual breeds
UPDATE dogs 
SET breed_id = (SELECT id FROM dog_breeds ORDER BY breed LIMIT 1)
WHERE breed_id NOT IN (SELECT id FROM dog_breeds);

-- Add foreign key constraint to ensure dogs.breed_id references dog_breeds.id
ALTER TABLE dogs 
ADD CONSTRAINT fk_dogs_breed_id 
FOREIGN KEY (breed_id) REFERENCES dog_breeds(id) ON DELETE RESTRICT;