/**
 * Public profile URLs. Set NEXT_PUBLIC_* env vars to override (e.g. staging):
 * Instagram, Facebook, Patreon, Ko-fi.
 */
export const SITE_INSTAGRAM_URL = 'https://www.instagram.com/ivehitmyhead/';
export const SITE_FACEBOOK_URL =
  'https://www.facebook.com/profile.php?id=100067374120979';

export function getPublicInstagramUrl(): string {
  return process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || SITE_INSTAGRAM_URL;
}

export function getPublicFacebookUrl(): string {
  return process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || SITE_FACEBOOK_URL;
}

/** Set NEXT_PUBLIC_PATREON_URL or replace the default when your campaign is live. */
const SITE_PATREON_URL = '';

export function getPublicPatreonUrl(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_PATREON_URL?.trim();
  if (fromEnv) return fromEnv;
  const fallback = SITE_PATREON_URL.trim();
  return fallback || null;
}

/** Set NEXT_PUBLIC_KOFI_URL (e.g. https://ko-fi.com/yourname) or replace the default. */
const SITE_KOFI_URL = '';

export function getPublicKofiUrl(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_KOFI_URL?.trim();
  if (fromEnv) return fromEnv;
  const fallback = SITE_KOFI_URL.trim();
  return fallback || null;
}
