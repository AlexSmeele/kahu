-- Add sort_order column to dogs table to support custom ordering
ALTER TABLE public.dogs ADD COLUMN sort_order INTEGER;

-- Set default sort_order values based on created_at (earliest created = lower sort_order)
WITH ranked_dogs AS (
    SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at ASC) as sort_order
    FROM public.dogs
)
UPDATE public.dogs 
SET sort_order = ranked_dogs.sort_order
FROM ranked_dogs 
WHERE public.dogs.id = ranked_dogs.id;