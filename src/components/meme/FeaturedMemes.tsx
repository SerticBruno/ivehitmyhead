import React from 'react';
import { FeaturedMemeCard } from './FeaturedMemeCard';
import { Meme } from '@/lib/types/meme';
import { ICONS } from '@/lib/utils/categoryIcons';

interface FeaturedMemesProps {
  memes: Meme[];
  onLike: (slug: string) => void;
  onShare: (id: string) => void;
  className?: string;
  likedMemes?: Set<string>;
}

export const FeaturedMemes: React.FC<FeaturedMemesProps> = ({
  memes,
  onLike,
  onShare,
  className = '',
  likedMemes
}) => {
  // Take only the first 6 memes for featured section
  const featuredMemes = memes.slice(0, 8);

  if (featuredMemes.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-6xl mb-4 flex justify-center">
          <ICONS.Star className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No featured memes</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          No featured memes available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {featuredMemes.map((meme) => (
        <div key={meme.id} className="relative">
          <FeaturedMemeCard
            meme={meme}
            onLike={onLike}
            onShare={onShare}
            className="h-full"
            isLiked={likedMemes?.has(meme.slug)}
          />
        </div>
      ))}
    </div>
  );
};
