import React from 'react';
import { MemeCard } from './MemeCard';
import { Meme } from '@/lib/types/meme';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';

interface MemeGridProps {
  memes: Meme[];
  onLike?: (slug: string) => void;
  onShare?: (id: string) => void;
  onComment?: (id: string) => void;
  className?: string;
  loading?: boolean;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  layout?: 'grid' | 'vertical';
  likedMemes?: Set<string>;
}

const MemeGrid: React.FC<MemeGridProps> = ({
  memes,
  onLike,
  onShare,
  onComment,
  className = '',
  loading = false,
  showLoadMore = false,
  onLoadMore,
  hasMore = false,
  layout = 'grid',
  likedMemes
}) => {
  const { setObserverTarget } = useInfiniteScroll({
    onLoadMore: onLoadMore || (() => {}),
    hasMore: hasMore && showLoadMore,
    loading,
    batchSize: 5, // 5 memes per batch
    itemCount: memes.length
  });

  if (loading && memes.length === 0) {
    if (layout === 'vertical') {
      return (
        <div className={`space-y-8 ${className}`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div 
                className="bg-gray-200 dark:bg-gray-800 rounded-lg" 
                style={{ 
                  height: 'calc(100vh - 300px)',
                  minHeight: '400px',
                  maxHeight: '800px'
                }}
              ></div>
            </div>
          ))}
        </div>
      );
    }
    
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

  if (layout === 'vertical') {
    return (
      <>
        <div className={`space-y-8 ${className}`}>
          {memes.map((meme, index) => (
            <div key={meme.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <MemeCard
                meme={meme}
                onLike={onLike}
                onShare={onShare}
                onComment={onComment}
                className="shadow-none border-0"
                isLiked={likedMemes?.has(meme.slug)}
              />
            </div>
          ))}
        </div>
        
        {/* Intersection Observer Target - positioned after every 5th item for better infinite scroll */}
        {showLoadMore && hasMore && (
          <div 
            ref={setObserverTarget}
            className="h-20 w-full flex items-center justify-center"
          >
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600 dark:text-gray-400">Loading 5 more memes...</span>
              </div>
            )}
          </div>
        )}
        
        {/* End of content indicator */}
        {!hasMore && memes.length > 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 text-sm">
              🎉 You've reached the end! No more memes in this category.
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {memes.map((meme) => (
          <MemeCard
            key={meme.id}
            meme={meme}
            onLike={onLike}
            onShare={onShare}
            onComment={onComment}
            isLiked={likedMemes?.has(meme.slug)}
          />
        ))}
      </div>
      
      {/* Infinite scroll observer - positioned after the grid */}
      {showLoadMore && hasMore && (
        <div 
          ref={setObserverTarget}
          className="h-20 w-full flex items-center justify-center"
        >
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading 3 more memes...</span>
            </div>
          )}
        </div>
      )}
      
      {/* End of content indicator */}
      {!hasMore && memes.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            🎉 You've reached the end! No more memes in this category.
          </div>
        </div>
      )}
    </>
  );
};

export { MemeGrid };
export type { MemeGridProps }; 