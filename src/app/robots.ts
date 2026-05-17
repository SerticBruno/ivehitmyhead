import type { MetadataRoute } from 'next';
import { getSiteOrigin } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteOrigin();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/budasevo',
          '/budasevo/',
          '/api/',
          '/debug',
          '/test',
          '/test-scroll',
          '/test-categories',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
