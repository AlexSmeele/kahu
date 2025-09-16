-- First, ensure all dogs have valid breed_id references
-- Set all dogs to use "Affenpinscher" (first breed alphabetically)
UPDATE dogs 
SET breed_id = (SELECT id FROM dog_breeds WHERE breed = 'Affenpinscher' LIMIT 1);

-- Now add the foreign key constraint
ALTER TABLE dogs 
ADD CONSTRAINT fk_dogs_breed_id 
FOREIGN KEY (breed_id) REFERENCES dog_breeds(id) ON DELETE RESTRICT;