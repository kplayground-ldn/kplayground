-- K-Playground Community - Supabase Database Setup
-- Run these commands in your Supabase SQL Editor (in order)

-- =================================================================
-- STEP 1: CREATE TABLES
-- =================================================================

-- Create profiles table to store user information
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table to store community posts
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table to store post comments
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  user_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =================================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY (RLS)
-- =================================================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on posts table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- STEP 3: CREATE POLICIES FOR PROFILES
-- =================================================================

-- Allow everyone to view profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- =================================================================
-- STEP 4: CREATE POLICIES FOR POSTS
-- =================================================================

-- Allow everyone to view all posts
CREATE POLICY "Posts are viewable by everyone"
  ON posts FOR SELECT
  USING (true);

-- Allow authenticated users to create posts
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins to delete any post
CREATE POLICY "Admins can delete any post"
  ON posts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Allow users to update their own posts (for pinning - will be admin only in app logic)
CREATE POLICY "Users can update posts"
  ON posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- =================================================================
-- STEP 5: CREATE POLICIES FOR COMMENTS
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
-- STEP 6: CREATE TRIGGER FOR NEW USER REGISTRATION
-- =================================================================

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that runs when a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- STEP 7: CREATE STORAGE BUCKET (Run in Storage section, not SQL)
-- =================================================================

-- Note: Go to Storage → Create a new bucket
-- Bucket name: post-images
-- Public bucket: YES

-- Then run these policies:
CREATE POLICY "Anyone can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

CREATE POLICY "Users can delete their own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'post-images' AND auth.uid() = owner);

-- =================================================================
-- STEP 8: CREATE FIRST ADMIN USER
-- =================================================================

-- IMPORTANT: Run this AFTER your first user has signed up
-- Replace 'admin@example.com' with the actual admin email

-- UPDATE profiles SET is_admin = TRUE WHERE email = 'admin@example.com';

-- =================================================================
-- VERIFICATION QUERIES
-- =================================================================

-- Check if tables were created successfully
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check if policies are enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- View all profiles
SELECT * FROM profiles;

-- View all posts
SELECT * FROM posts ORDER BY created_at DESC;

-- =================================================================
-- USEFUL QUERIES FOR MAINTENANCE
-- =================================================================

-- Make a user an admin
-- UPDATE profiles SET is_admin = TRUE WHERE email = 'user@example.com';

-- Remove admin status
-- UPDATE profiles SET is_admin = FALSE WHERE email = 'user@example.com';

-- Delete all posts (be careful!)
-- DELETE FROM posts;

-- View all admins
-- SELECT email, is_admin FROM profiles WHERE is_admin = TRUE;

-- =================================================================
-- SETUP COMPLETE!
-- =================================================================
