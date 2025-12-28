-- Add is_admin column to profiles table
-- Run this in your Supabase SQL Editor if you want to use the is_admin column
-- Note: The code works without this column by using user_metadata.role instead

-- Add the is_admin column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create an index for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- Update existing admin users (if any) to set is_admin = true
-- This assumes admin users have role = 'admin' in their user_metadata
-- You may need to manually update specific users:
-- UPDATE public.profiles SET is_admin = TRUE WHERE id = 'user-uuid-here';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name = 'is_admin';

