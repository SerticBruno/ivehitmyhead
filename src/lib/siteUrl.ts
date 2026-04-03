/**
 * Canonical site origin for metadata, sitemap, and OG URLs.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://ivehitmyhead.com).
 */
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) {
    try {
      return new URL(explicit);
    } catch {
      /* fall through */
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`);
  }
  return new URL('http://localhost:3000');
}

export function getSiteOrigin(): string {
  return getSiteUrl().origin;
}
