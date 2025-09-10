-- Transfer all dog data from mock user to real user (alexsmeele@gmail.com)
UPDATE dogs 
SET user_id = 'b197063d-9f5b-42c3-888e-3e85e8829141'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';

-- Remove development RLS policies that allowed mock user access
DROP POLICY IF EXISTS "Allow mock user operations for development" ON dogs;
DROP POLICY IF EXISTS "Allow mock user operations for development on dog_tricks" ON dog_tricks;
DROP POLICY IF EXISTS "Allow mock user operations for weight records development" ON weight_records;