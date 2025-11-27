-- Migration: Add notifications system
-- Run this in your Supabase SQL Editor

-- =================================================================
-- STEP 1: CREATE NOTIFICATIONS TABLE
-- =================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,  -- Who receives the notification
  type TEXT NOT NULL,  -- e.g., 'comment', 'like'
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES auth.users NOT NULL,  -- Who did the action
  actor_username TEXT NOT NULL,  -- Username of who did the action
  content TEXT NOT NULL,  -- e.g., 'commented on your post'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- STEP 2: CREATE INDEXES FOR BETTER PERFORMANCE
-- =================================================================

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at DESC);

-- =================================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- =================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System can insert notifications (via trigger)
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- =================================================================
-- STEP 4: CREATE FUNCTION TO CREATE COMMENT NOTIFICATIONS
-- =================================================================

CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  commenter_username TEXT;
BEGIN
  -- Get the post owner's ID
  SELECT user_id INTO post_owner_id
  FROM posts
  WHERE id = NEW.post_id;

  -- Get the commenter's username
  SELECT username INTO commenter_username
  FROM profiles
  WHERE id = NEW.user_id;

  -- Only create notification if:
  -- 1. The commenter is not the post owner (don't notify yourself)
  -- 2. We found a valid post owner
  IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
    INSERT INTO notifications (
      user_id,
      type,
      post_id,
      actor_id,
      actor_username,
      content
    ) VALUES (
      post_owner_id,
      'comment',
      NEW.post_id,
      NEW.user_id,
      COALESCE(commenter_username, NEW.user_email),
      'commented on your post'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- STEP 5: CREATE TRIGGER ON COMMENTS TABLE
-- =================================================================

DROP TRIGGER IF EXISTS on_comment_created ON comments;

CREATE TRIGGER on_comment_created
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_notification();

-- =================================================================
-- STEP 6: VERIFICATION QUERIES
-- =================================================================

-- Check if table was created
SELECT * FROM notifications LIMIT 5;

-- Check if policies are enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'notifications';

-- View all notifications (admin only)
-- SELECT * FROM notifications ORDER BY created_at DESC;

-- =================================================================
-- SETUP COMPLETE!
-- =================================================================
