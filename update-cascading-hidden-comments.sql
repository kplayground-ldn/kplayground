-- Update hidden comments policy to cascade to replies
-- If a parent comment is hidden, all its replies should also be hidden (inherit the visibility)

-- =================================================================
-- DROP EXISTING POLICY
-- =================================================================

DROP POLICY IF EXISTS "Comments are viewable based on visibility rules" ON comments;

-- =================================================================
-- CREATE NEW CASCADING HIDDEN VISIBILITY POLICY
-- =================================================================

-- This policy ensures that:
-- 1. Public comments with no hidden parents are visible to everyone
-- 2. If a parent comment is hidden, all its replies inherit the hidden visibility
-- 3. Hidden comments/replies are only visible to:
--    - The comment/reply author
--    - The post author
--    - The parent comment author (for replies)

CREATE POLICY "Comments are viewable based on cascading visibility rules"
  ON comments FOR SELECT
  USING (
    CASE
      -- If this is a top-level comment
      WHEN parent_comment_id IS NULL THEN
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

      -- If this is a reply to another comment
      ELSE
        -- Check if parent comment is hidden
        CASE
          WHEN (SELECT is_hidden FROM comments parent WHERE parent.id = comments.parent_comment_id) = true THEN
            -- Parent is hidden, so this reply is also hidden - only visible to specific users
            auth.uid() = user_id  -- The reply author
            OR
            auth.uid() IN (  -- The post author
              SELECT user_id FROM posts WHERE posts.id = comments.post_id
            )
            OR
            auth.uid() IN (  -- The parent comment author
              SELECT user_id FROM comments parent WHERE parent.id = comments.parent_comment_id
            )
          ELSE
            -- Parent is public, check this comment's visibility
            is_hidden = false  -- Public reply visible to everyone
            OR
            auth.uid() = user_id  -- Hidden reply visible to reply author
            OR
            auth.uid() IN (  -- Hidden reply visible to post author
              SELECT user_id FROM posts WHERE posts.id = comments.post_id
            )
        END
    END
  );

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- View updated policies
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'comments';
