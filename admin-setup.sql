-- Admin Setup SQL Script
-- Run this in your Supabase SQL Editor

-- Create the admin profile (this should work)
INSERT INTO public.profiles (id, username, display_name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'Admin User',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  updated_at = now();

-- Verify the profile was created
SELECT * FROM public.profiles WHERE username = 'admin';

-- Create default categories with UUIDs that match frontend IDs
INSERT INTO public.categories (id, name, emoji, description, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Funny', '😂', 'Humor and comedy memes', now()),
  ('00000000-0000-0000-0000-000000000002', 'Gaming', '🎮', 'Video game related memes', now()),
  ('00000000-0000-0000-0000-000000000003', 'Tech', '💻', 'Technology and programming memes', now()),
  ('00000000-0000-0000-0000-000000000004', 'Animals', '🐕', 'Cute and funny animal memes', now()),
  ('00000000-0000-0000-0000-000000000005', 'Random', '🎲', 'Miscellaneous and random memes', now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  emoji = EXCLUDED.emoji,
  description = EXCLUDED.description,
  updated_at = now();

-- Verify categories were created
SELECT * FROM public.categories;

-- TEMPORARILY disable RLS for testing (re-enable later for production)
ALTER TABLE public.memes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('memes', 'profiles', 'categories');
