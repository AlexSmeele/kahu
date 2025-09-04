-- First let's see what constraints exist on the tricks table
SELECT conname, contype, consrc 
FROM pg_constraint 
WHERE conrelid = 'tricks'::regclass;