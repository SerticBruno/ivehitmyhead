CREATE TABLE IF NOT EXISTS public.user_generated_memes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  template_name TEXT,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_generated_memes_user_id
  ON public.user_generated_memes(user_id);

CREATE INDEX IF NOT EXISTS idx_user_generated_memes_created_at
  ON public.user_generated_memes(created_at DESC);

ALTER TABLE public.user_generated_memes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Generated memes are viewable by owner"
  ON public.user_generated_memes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generated memes"
  ON public.user_generated_memes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated memes"
  ON public.user_generated_memes
  FOR DELETE
  USING (auth.uid() = user_id);
