import React from 'react';
import { MemeCard, MemeCardProps } from './MemeCard';

interface MemeGridProps {
  memes: Omit<MemeCardProps, 'onLike' | 'onShare' | 'onComment'>[];
  onLike?: (id: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
  className?: string;
  loading?: boolean;
}

const MemeGrid: React.FC<MemeGridProps> = ({
  memes,
  onLike,
  onShare,
  onComment,
  className = '',
  loading = false
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-80"></div>
          </div>
        ))}
      </div>
    );
  }

  if (memes.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="text-6xl mb-4">😢</div>
        <h3 className="text-xl font-semibold mb-2">No memes found</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          Looks like there are no memes here yet. Be the first to upload something hilarious!
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {memes.map((meme) => (
        <MemeCard
          key={meme.id}
          {...meme}
          onLike={onLike}
          onShare={onShare}
          onComment={onComment}
        />
      ))}
    </div>
  );
};

export { MemeGrid };
export type { MemeGridProps }; 