import type { Meme } from '@/lib/types/meme';

/** Slug for the homepage-only mock; detail route is not backed by the DB. */
export const HOMEPAGE_HOTTEST_MOCK_MEME_SLUG = 'mock-hottest-stats-preview';

/**
 * When true, the first card in "Hottest Memes" is a local mock (large counts for layout checks).
 * Enabled in development, or set NEXT_PUBLIC_PREPEND_HOMEPAGE_HOTTEST_MOCK_MEME=true.
 */
export function shouldPrependHomepageHottestMockMeme(): boolean {
  return (
    process.env.NEXT_PUBLIC_PREPEND_HOMEPAGE_HOTTEST_MOCK_MEME === 'true' ||
    process.env.NODE_ENV === 'development'
  );
}

export const HOMEPAGE_HOTTEST_MOCK_MEME: Meme = {
  id: '00000000-0000-4000-8000-000000000001',
  title: 'Mock: hottest stats preview',
  slug: HOMEPAGE_HOTTEST_MOCK_MEME_SLUG,
  image_url: '/images/templates/ab.png',
  cloudinary_public_id: 'local/mock-only',
  author_id: '00000000-0000-4000-8000-000000000002',
  author: {
    id: '00000000-0000-4000-8000-000000000002',
    username: 'mockauthor',
    display_name: 'Mock Author',
    created_at: '2024-06-01T12:00:00.000Z',
    updated_at: '2024-06-01T12:00:00.000Z',
  },
  category: {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Classic',
    emoji: '📁',
    created_at: '2024-06-01T12:00:00.000Z',
  },
  tags: ['mock', 'preview'],
  views: 45_450,
  likes_count: 1_248,
  comments_count: 0,
  shares_count: 2_343,
  created_at: '2024-06-15T12:00:00.000Z',
  updated_at: '2024-06-15T12:00:00.000Z',
  is_liked: false,
};
