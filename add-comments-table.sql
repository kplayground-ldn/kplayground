-- Add Comments Table to K-Playground Community
-- Run these commands in your Supabase SQL Editor

-- =================================================================
-- CREATE COMMENTS TABLE
-- =================================================================

CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- ENABLE ROW LEVEL SECURITY
-- =================================================================

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- CREATE POLICIES FOR COMMENTS
-- =================================================================

-- Allow everyone to view all comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins to delete any comment
CREATE POLICY "Admins can delete any comment"
  ON comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- =================================================================
-- VERIFICATION
-- =================================================================

-- Check if the comments table was created
SELECT * FROM comments LIMIT 5;

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'comments';
