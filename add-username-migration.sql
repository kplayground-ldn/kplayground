-- Migration: Add username field to profiles, posts, and comments tables
-- Run this in your Supabase SQL Editor

-- Step 1: Add username column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Step 2: Add username column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS username TEXT;

-- Step 3: Add username column to comments table
ALTER TABLE comments ADD COLUMN IF NOT EXISTS username TEXT;

-- Step 4: Update the handle_new_user function to include username from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: For existing users without usernames, set username to email prefix
UPDATE profiles
SET username = split_part(email, '@', 1)
WHERE username IS NULL OR username = '';

-- Step 6: For existing posts without usernames, set username from user email
UPDATE posts
SET username = split_part(user_email, '@', 1)
WHERE username IS NULL OR username = '';

-- Step 7: For existing comments without usernames, set username from user email
UPDATE comments
SET username = split_part(user_email, '@', 1)
WHERE username IS NULL OR username = '';

-- Step 8: Make username NOT NULL after backfilling data
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
ALTER TABLE posts ALTER COLUMN username SET NOT NULL;
ALTER TABLE comments ALTER COLUMN username SET NOT NULL;

-- Step 9: Add index on username for faster queries
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);
