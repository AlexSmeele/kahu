-- Rename existing tables to match new naming convention

-- Rename dog_walkers to walkers (the main service provider table)
ALTER TABLE public.dog_walkers RENAME TO walkers;

-- Rename dog_dog_walkers to dog_walkers (the junction table)
ALTER TABLE public.dog_dog_walkers RENAME TO dog_walkers;

-- Update the foreign key constraint on the renamed junction table
ALTER TABLE public.dog_walkers 
  DROP CONSTRAINT IF EXISTS dog_dog_walkers_walker_id_fkey;

ALTER TABLE public.dog_walkers
  ADD CONSTRAINT dog_walkers_walker_id_fkey 
  FOREIGN KEY (walker_id) REFERENCES walkers(id) ON DELETE CASCADE;

-- Rename triggers to match new table names
ALTER TRIGGER update_dog_walkers_updated_at ON public.walkers
  RENAME TO update_walkers_updated_at;

ALTER TRIGGER update_dog_dog_walkers_updated_at ON public.dog_walkers
  RENAME TO update_dog_walkers_updated_at;