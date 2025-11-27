-- Migration: Change from single image_url to multiple image_urls
-- Run this in your Supabase SQL Editor

-- Step 1: Add new column for multiple images (JSONB array)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing single image_url to image_urls array
-- Convert existing single image URLs to array format
UPDATE posts
SET image_urls =
  CASE
    WHEN image_url IS NOT NULL AND image_url != '' THEN jsonb_build_array(image_url)
    ELSE '[]'::jsonb
  END
WHERE image_urls = '[]'::jsonb;

-- Step 3: Optional - Drop the old image_url column after verifying migration
-- Uncomment the line below after you've verified the migration worked correctly
-- ALTER TABLE posts DROP COLUMN image_url;

-- Step 4: Verify the migration
-- Check a few posts to ensure data migrated correctly
SELECT id, image_url, image_urls FROM posts LIMIT 10;
