/**
 * Absolute URL for social previews (Open Graph / Twitter).
 */
export function toAbsoluteResourceUrl(href: string, siteOrigin: string): string {
  const t = href.trim();
  if (!t) return t;
  if (t.startsWith('http://') || t.startsWith('https://')) {
    return t;
  }
  const base = siteOrigin.replace(/\/$/, '');
  const path = t.startsWith('/') ? t : `/${t}`;
  return `${base}${path}`;
}

/**
 * Insert Cloudinary delivery transforms so crawlers get a bounded, optimized image
 * (helps link-preview timeouts and CDN caches).
 */
export function cloudinaryOpenGraphDeliveryUrl(url: string): string {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('res.cloudinary.com')) {
      return url;
    }
    const marker = '/upload/';
    const i = u.pathname.indexOf(marker);
    if (i === -1) {
      return url;
    }
    const before = u.pathname.slice(0, i + marker.length);
    const after = u.pathname.slice(i + marker.length);
    if (!after || after.startsWith('w_') || after.startsWith('c_') || after.startsWith('f_')) {
      return url;
    }
    const transforms = 'w_1200,h_1200,c_limit,q_auto:good,f_auto';
    u.pathname = `${before}${transforms}/${after}`;
    return u.toString();
  } catch {
    return url;
  }
}

export function memeShareImageUrl(imageUrl: string, siteOrigin: string): string {
  const absolute = toAbsoluteResourceUrl(imageUrl, siteOrigin);
  return cloudinaryOpenGraphDeliveryUrl(absolute);
}
