-- Enable Row Level Security on the owners table
ALTER TABLE owners_gt86aero2024 ENABLE ROW LEVEL SECURITY;

-- Drop existing public read policy if it exists
DROP POLICY IF EXISTS "Public profiles are viewable" ON owners_gt86aero2024;
DROP POLICY IF EXISTS "Allow public read access" ON owners_gt86aero2024;
DROP POLICY IF EXISTS "Enable read access for public profiles" ON owners_gt86aero2024;

-- Create comprehensive public read policy
CREATE POLICY "Public profiles are viewable"
ON owners_gt86aero2024
FOR SELECT
USING (public_profile = true);

-- Ensure authenticated users can still manage their own profiles
DROP POLICY IF EXISTS "Users can view own profile" ON owners_gt86aero2024;
CREATE POLICY "Users can view own profile"
ON owners_gt86aero2024
FOR SELECT
USING (auth.uid() = user_id);

-- Ensure authenticated users can update their own profiles
DROP POLICY IF EXISTS "Users can update own profile" ON owners_gt86aero2024;
CREATE POLICY "Users can update own profile"
ON owners_gt86aero2024
FOR UPDATE
USING (auth.uid() = user_id);

-- Ensure authenticated users can insert their own profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON owners_gt86aero2024;
CREATE POLICY "Users can insert own profile"
ON owners_gt86aero2024
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Ensure authenticated users can delete their own profiles
DROP POLICY IF EXISTS "Users can delete own profile" ON owners_gt86aero2024;
CREATE POLICY "Users can delete own profile"
ON owners_gt86aero2024
FOR DELETE
USING (auth.uid() = user_id);

-- Verify the policies are active
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'owners_gt86aero2024'
ORDER BY policyname;