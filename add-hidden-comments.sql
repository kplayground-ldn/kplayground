-- Add hidden comments feature
-- This allows users to post comments that are only visible to the comment author and post author

-- =================================================================
-- STEP 1: ADD is_hidden COLUMN TO COMMENTS TABLE
-- =================================================================

ALTER TABLE comments ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE;

-- =================================================================
-- STEP 2: DROP EXISTING "Comments are viewable by everyone" POLICY
-- =================================================================

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;

-- =================================================================
-- STEP 3: CREATE NEW SELECTIVE VISIBILITY POLICY
-- =================================================================

-- Allow users to view comments based on visibility rules:
-- 1. All public comments (is_hidden = false) are visible to everyone
-- 2. Hidden comments (is_hidden = true) are only visible to:
--    - The comment author (user_id matches)
--    - The post author (post's user_id matches)
CREATE POLICY "Comments are viewable based on visibility rules"
  ON comments FOR SELECT
  USING (
    -- Public comments are visible to everyone
    is_hidden = false
    OR
    -- Hidden comments are visible to comment author
    auth.uid() = user_id
    OR
    -- Hidden comments are visible to post author
    auth.uid() IN (
      SELECT user_id FROM posts WHERE posts.id = comments.post_id
    )
  );

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- Check if the column was added successfully
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'comments' AND column_name = 'is_hidden';

-- View updated policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'comments';
