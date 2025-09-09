-- Add sort_order column to dogs table to support custom ordering
ALTER TABLE public.dogs ADD COLUMN sort_order INTEGER;

-- Set default sort_order values based on created_at (earliest created = lower sort_order)
UPDATE public.dogs 
SET sort_order = row_number() 
FROM (
    SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_number
    FROM public.dogs
) ranked 
WHERE public.dogs.id = ranked.id;