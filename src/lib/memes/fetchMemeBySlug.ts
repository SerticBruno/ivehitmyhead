import { supabaseAdmin } from '@/lib/supabase/server';
import type { Meme } from '@/lib/types/meme';

export type FetchMemeResult =
  | { ok: true; meme: Meme }
  | { ok: false; status: 404 | 500 };

/**
 * Server-only fetch for metadata, sitemap, etc. Mirrors GET /api/memes/[slug] selection.
 */
export async function fetchMemeBySlug(slug: string): Promise<FetchMemeResult> {
  if (!slug) {
    return { ok: false, status: 404 };
  }

  const { data: meme, error } = await supabaseAdmin
    .from('memes')
    .select(
      `
        *,
        author:profiles(username, display_name, avatar_url),
        category:categories(name, description)
      `,
    )
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { ok: false, status: 404 };
    }
    console.error('fetchMemeBySlug:', error);
    return { ok: false, status: 500 };
  }

  return { ok: true, meme: meme as Meme };
}
