import type { Metadata } from 'next';
import { fetchMemeBySlug } from '@/lib/memes/fetchMemeBySlug';
import { memeShareImageUrl } from '@/lib/og/memeOpenGraphImage';
import { getSiteOrigin } from '@/lib/siteUrl';
import { MemeDetailClient } from './MemeDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchMemeBySlug(slug);
  const origin = getSiteOrigin();
  const pageUrl = `${origin}/meme/${slug}`;

  if (!result.ok) {
    return {
      title: 'Meme',
      description: 'Meme on IVEHITMYHEAD.',
      alternates: { canonical: pageUrl },
    };
  }

  const { meme } = result;
  const title = `${meme.title} | IVEHITMYHEAD`;
  const description =
    meme.tags && meme.tags.length > 0
      ? `${meme.title} — tags: ${meme.tags.slice(0, 5).join(', ')}.`
      : `View “${meme.title}” on IVEHITMYHEAD.`;

  const ogImage =
    meme.image_url && meme.image_url.trim()
      ? memeShareImageUrl(meme.image_url, origin)
      : null;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: pageUrl,
      siteName: 'IVEHITMYHEAD',
      locale: 'en_US',
      publishedTime: meme.created_at,
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: meme.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function MemeDetailPage({ params }: Props) {
  const { slug } = await params;
  return <MemeDetailClient slug={slug} />;
}
