-- Fix the posts UPDATE policy to allow pinning
-- Run this in Supabase SQL Editor

-- First, drop the existing incomplete policy
DROP POLICY IF EXISTS "Users can update posts" ON posts;

-- Create the correct policy with both USING and WITH CHECK
CREATE POLICY "Users can update posts"
  ON posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verify it worked - this should show the policy
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'posts' AND cmd = 'UPDATE';
