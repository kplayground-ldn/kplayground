-- Add comment reply/threading feature
-- This allows users to reply to comments, creating a threaded conversation

-- =================================================================
-- STEP 1: ADD parent_comment_id COLUMN TO COMMENTS TABLE
-- =================================================================

-- Add nullable parent_comment_id that references another comment
ALTER TABLE comments
ADD COLUMN parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE;

-- =================================================================
-- STEP 2: CREATE INDEX FOR BETTER QUERY PERFORMANCE
-- =================================================================

-- Index for finding all replies to a specific comment
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment_id
ON comments(parent_comment_id);

-- Index for finding top-level comments (parent_comment_id is null)
CREATE INDEX IF NOT EXISTS idx_comments_post_id_parent_null
ON comments(post_id) WHERE parent_comment_id IS NULL;

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- Check if the column was added successfully
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'comments' AND column_name = 'parent_comment_id';

-- View indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'comments';

-- =================================================================
-- NOTES
-- =================================================================
-- parent_comment_id = NULL means it's a top-level comment (reply to the post)
-- parent_comment_id = <UUID> means it's a reply to another comment
-- ON DELETE CASCADE ensures that if a parent comment is deleted, all its replies are also deleted
