-- Check if there's a foreign key on dogs table and drop it if exists
DO $$ 
BEGIN
    -- Check if the constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'dogs_user_id_fkey' 
        AND table_name = 'dogs'
    ) THEN
        ALTER TABLE dogs DROP CONSTRAINT dogs_user_id_fkey;
    END IF;
END $$;