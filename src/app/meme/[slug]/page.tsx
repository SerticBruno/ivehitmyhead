import type { Metadata } from 'next';
import { fetchMemeBySlug } from '@/lib/memes/fetchMemeBySlug';
import { getSiteOrigin } from '@/lib/siteUrl';
import { MemeDetailClient } from './MemeDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchMemeBySlug(slug);

  if (!result.ok) {
    return {
      title: 'Meme',
      description: 'Meme on IVEHITMYHEAD.',
    };
  }

  const { meme } = result;
  const title = `${meme.title} | IVEHITMYHEAD`;
  const description =
    meme.tags?.length > 0
      ? `${meme.title} — tags: ${meme.tags.slice(0, 5).join(', ')}.`
      : `View “${meme.title}” on IVEHITMYHEAD.`;

  const images = meme.image_url ? [{ url: meme.image_url, alt: meme.title }] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${getSiteOrigin()}/meme/${slug}`,
      images,
    },
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      images: images?.map((i) => i.url),
    },
  };
}

export default async function MemeDetailPage({ params }: Props) {
  const { slug } = await params;
  return <MemeDetailClient slug={slug} />;
}
