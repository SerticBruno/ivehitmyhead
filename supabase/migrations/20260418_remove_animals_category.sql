-- Remove Animals category; memes using it get category_id cleared (FK ON DELETE SET NULL).

UPDATE public.memes
SET category_id = NULL
WHERE category_id IN (
  SELECT id FROM public.categories WHERE name = 'Animals'
);

DELETE FROM public.categories WHERE name = 'Animals';
