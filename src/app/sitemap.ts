import type { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getSiteOrigin } from '@/lib/siteUrl';

const MEME_SITEMAP_LIMIT = 5000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteOrigin();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/memes`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/meme-generator`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const { data: rows, error } = await supabaseAdmin
    .from('memes')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })
    .limit(MEME_SITEMAP_LIMIT);

  if (error) {
    console.error('sitemap: memes query failed', error);
    return staticRoutes;
  }

  const memeEntries: MetadataRoute.Sitemap = (rows ?? []).map((row) => {
    const lastMod = row.updated_at ? new Date(row.updated_at) : now;
    return {
      url: `${base}/meme/${row.slug}`,
      lastModified: lastMod,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    };
  });

  return [...staticRoutes, ...memeEntries];
}
