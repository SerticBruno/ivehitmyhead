-- One-time: remove Funny, Gaming, Tech; add Wholesome (run in Supabase SQL editor if DB already seeded)
-- Memes using deleted categories get category_id cleared (FK ON DELETE SET NULL).

UPDATE public.memes
SET category_id = NULL
WHERE category_id IN (
  SELECT id FROM public.categories WHERE name IN ('Funny', 'Gaming', 'Tech')
);

DELETE FROM public.categories WHERE name IN ('Funny', 'Gaming', 'Tech');

INSERT INTO public.categories (name, emoji, description)
VALUES ('Wholesome', '🌻', 'Feel-good, kind, and heartwarming memes')
ON CONFLICT (name) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  description = EXCLUDED.description;
