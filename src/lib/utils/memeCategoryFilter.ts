import { Category } from '@/lib/types/meme';

/** Category names hidden from the public memes filter UI (DB rows may still exist). */
const HIDDEN_FROM_MEME_FILTERS = new Set(['gaming']);

export function visibleMemeFilterCategories(categories: Category[]): Category[] {
  return categories.filter(
    (c) => !HIDDEN_FROM_MEME_FILTERS.has(c.name.trim().toLowerCase())
  );
}
