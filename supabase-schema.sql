-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memes table
CREATE TABLE public.memes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  views INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table
CREATE TABLE public.meme_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meme_id UUID REFERENCES public.memes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meme_id, user_id)
);

-- Create comments table
CREATE TABLE public.meme_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meme_id UUID REFERENCES public.memes(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.meme_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create views tracking table
CREATE TABLE public.meme_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meme_id UUID REFERENCES public.memes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_memes_author_id ON public.memes(author_id);
CREATE INDEX idx_memes_category_id ON public.memes(category_id);
CREATE INDEX idx_memes_created_at ON public.memes(created_at DESC);
CREATE INDEX idx_memes_likes_count ON public.memes(likes_count DESC);
CREATE INDEX idx_memes_views ON public.memes(views DESC);
CREATE INDEX idx_meme_likes_meme_id ON public.meme_likes(meme_id);
CREATE INDEX idx_meme_likes_user_id ON public.meme_likes(user_id);
CREATE INDEX idx_meme_comments_meme_id ON public.meme_comments(meme_id);
CREATE INDEX idx_meme_comments_author_id ON public.meme_comments(author_id);
CREATE INDEX idx_meme_views_meme_id ON public.meme_views(meme_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meme_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meme_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meme_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can read all profiles, update only their own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: Everyone can read categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Memes: Everyone can read memes, authenticated users can create/update/delete their own
CREATE POLICY "Memes are viewable by everyone" ON public.memes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create memes" ON public.memes FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own memes" ON public.memes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own memes" ON public.memes FOR DELETE USING (auth.uid() = author_id);

-- Likes: Everyone can read likes, authenticated users can manage their own
CREATE POLICY "Likes are viewable by everyone" ON public.meme_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create likes" ON public.meme_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.meme_likes FOR DELETE USING (auth.uid() = user_id);

-- Comments: Everyone can read comments, authenticated users can manage their own
CREATE POLICY "Comments are viewable by everyone" ON public.meme_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.meme_comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own comments" ON public.meme_comments FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own comments" ON public.meme_comments FOR DELETE USING (auth.uid() = author_id);

-- Views: Everyone can read views, authenticated users can create views
CREATE POLICY "Views are viewable by everyone" ON public.meme_views FOR SELECT USING (true);
CREATE POLICY "Anyone can create views" ON public.meme_views FOR INSERT WITH CHECK (true);

-- Functions for updating counts
CREATE OR REPLACE FUNCTION update_meme_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.memes SET likes_count = likes_count + 1 WHERE id = NEW.meme_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.memes SET likes_count = likes_count - 1 WHERE id = OLD.meme_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_meme_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.memes SET comments_count = comments_count + 1 WHERE id = NEW.meme_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.memes SET comments_count = comments_count - 1 WHERE id = OLD.meme_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic count updates
CREATE TRIGGER trigger_update_meme_likes_count
  AFTER INSERT OR DELETE ON public.meme_likes
  FOR EACH ROW EXECUTE FUNCTION update_meme_likes_count();

CREATE TRIGGER trigger_update_meme_comments_count
  AFTER INSERT OR DELETE ON public.meme_comments
  FOR EACH ROW EXECUTE FUNCTION update_meme_comments_count();

-- Insert default categories
INSERT INTO public.categories (name, emoji, description) VALUES
  ('Funny', '😂', 'Humor and comedy memes'),
  ('Gaming', '🎮', 'Video game related memes'),
  ('Tech', '💻', 'Technology and programming memes'),
  ('Animals', '🐕', 'Cute and funny animal memes'),
  ('Movies', '🎬', 'Film and TV show memes'),
  ('Sports', '⚽', 'Sports and athletic memes'),
  ('Food', '🍕', 'Food and cooking memes'),
  ('School', '📚', 'Education and student life memes'),
  ('Work', '💼', 'Office and work life memes'),
  ('Random', '🎲', 'Miscellaneous and random memes');
