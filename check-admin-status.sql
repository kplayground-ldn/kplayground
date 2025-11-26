-- Run this in Supabase SQL Editor to check admin status
-- This will show all users and their admin status

SELECT
  email,
  is_admin,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- If you need to make yourself an admin, run this:
-- (Replace 'your-email@example.com' with your actual email)

-- UPDATE profiles
-- SET is_admin = TRUE
-- WHERE email = 'your-email@example.com';
