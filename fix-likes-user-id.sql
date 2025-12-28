-- Fix meme_likes table to support anonymous users with session IDs
-- This changes user_id from UUID to TEXT to allow session-based likes
-- 
-- Note: Existing UUID values will be converted to text strings, preserving existing likes

-- STEP 1: Drop ALL policies on meme_likes table first (required before altering column)
-- Note: PostgreSQL requires dropping policies before altering column types they reference

-- Drop known policies
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.meme_likes;
DROP POLICY IF EXISTS "Authenticated users can create likes" ON public.meme_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.meme_likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON public.meme_likes;
DROP POLICY IF EXISTS "Anyone can create likes" ON public.meme_likes;
DROP POLICY IF EXISTS "Anyone can delete likes" ON public.meme_likes;
DROP POLICY IF EXISTS "Anyone can read likes" ON public.meme_likes;

-- Automatically drop any remaining policies (handles unknown policy names)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'meme_likes' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.meme_likes';
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- STEP 2: Drop the foreign key constraint if it exists
ALTER TABLE public.meme_likes 
  DROP CONSTRAINT IF EXISTS meme_likes_user_id_fkey;

-- STEP 3: Change the column type from UUID to TEXT
-- This will convert existing UUIDs to their text representation (e.g., '550e8400-e29b-41d4-a716-446655440000')
ALTER TABLE public.meme_likes 
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Create new policies that allow anonymous access
CREATE POLICY "Likes are viewable by everyone" ON public.meme_likes FOR SELECT USING (true);
CREATE POLICY "Anyone can create likes" ON public.meme_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete likes" ON public.meme_likes FOR DELETE USING (true);

-- Recreate the index (it should still work with TEXT)
CREATE INDEX IF NOT EXISTS idx_meme_likes_user_id ON public.meme_likes(user_id);

