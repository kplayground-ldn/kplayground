-- Update comments visibility policy to show all comments to everyone
-- Hidden comments will display "this message is hidden" on the client side
-- This ensures comment counts are accurate and users know conversations exist

-- =================================================================
-- DROP EXISTING POLICY
-- =================================================================

DROP POLICY IF EXISTS "Comments are viewable based on cascading visibility rules" ON comments;
DROP POLICY IF EXISTS "Comments are viewable based on visibility rules" ON comments;

-- =================================================================
-- CREATE NEW POLICY - SHOW ALL COMMENTS
-- =================================================================

-- All comments (hidden and public) are visible to everyone
-- The client side will handle masking the content for hidden comments
CREATE POLICY "All comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- View updated policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'comments';

-- =================================================================
-- NOTES
-- =================================================================
-- With this policy, all comments are returned to all users
-- The client-side logic will determine whether to show:
-- 1. The actual comment content (for authorized users)
-- 2. "This message is hidden" (for unauthorized users)
--
-- Authorized users for hidden comments:
-- - Comment author
-- - Post author
-- - Parent comment author (for replies)
