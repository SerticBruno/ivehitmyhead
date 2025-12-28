-- Update Password SQL Script for Supabase
-- Run this in your Supabase SQL Editor
-- 
-- IMPORTANT: Replace the email and new_password values below before running

-- Enable pgcrypto extension if not already enabled (required for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update password for a user by email
-- Replace 'user@example.com' with the actual email
-- Replace 'new_password_here' with the desired password
UPDATE auth.users
SET 
  encrypted_password = crypt('new_password_here', gen_salt('bf')),
  updated_at = now()
WHERE email = 'user@example.com';

-- Verify the update (optional - check that the user exists)
SELECT 
  id,
  email,
  created_at,
  updated_at
FROM auth.users
WHERE email = 'user@example.com';

-- Alternative: Update password by user ID
-- Uncomment and use this if you know the user's UUID instead of email
/*
UPDATE auth.users
SET 
  encrypted_password = crypt('new_password_here', gen_salt('bf')),
  updated_at = now()
WHERE id = '00000000-0000-0000-0000-000000000000';
*/

