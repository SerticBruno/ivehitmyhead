/**
 * Public profile URLs. Set NEXT_PUBLIC_INSTAGRAM_URL / NEXT_PUBLIC_FACEBOOK_URL to override (e.g. staging).
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
