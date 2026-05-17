CREATE TABLE IF NOT EXISTS public.meme_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meme_id UUID REFERENCES public.memes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (meme_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_meme_shares_meme_id
  ON public.meme_shares(meme_id);

CREATE INDEX IF NOT EXISTS idx_meme_shares_user_id
  ON public.meme_shares(user_id);

ALTER TABLE public.meme_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shares are viewable by owner"
  ON public.meme_shares
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own shares"
  ON public.meme_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own shares"
  ON public.meme_shares
  FOR DELETE
  USING (auth.uid() = user_id);
