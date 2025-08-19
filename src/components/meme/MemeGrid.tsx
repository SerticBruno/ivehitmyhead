import React from 'react';
import { MemeCard } from './MemeCard';
import { MemeGridProps } from '@/lib/types/meme';
import { ICONS } from '@/lib/utils/categoryIcons';
import { imagePreloader } from '@/lib/utils/imagePreloader';
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll';

export const MemeGrid: React.FC<MemeGridProps> = ({
  memes,
  onLike,
  onShare,
  onComment,
  className = '',
  loading = false,
  showLoadMore = false,
  onLoadMore,
  hasMore = false,
  layout = 'vertical',
  likedMemes
}) => {
  // Preload images for better performance when navigating back
  React.useEffect(() => {
    if (memes.length > 0) {
      const imageUrls = memes.map(meme => meme.image_url);
      imagePreloader.preloadImages(imageUrls, { priority: 'high' });
    }
  }, [memes]);

  // Set up infinite scroll
  const { setObserverTarget } = useInfiniteScroll({
    onLoadMore: onLoadMore || (() => {}),
    hasMore: hasMore && showLoadMore,
    loading,
    batchSize: 5,
    itemCount: memes.length,
    rootMargin: '800px' // Trigger loading when 800px from bottom
  });

  if (loading && memes.length === 0) {
    return (
      <div className={`grid gap-6 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-4"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-3/4"></div>
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            <div className="p-6">
              <div className="flex justify-between items-center">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (memes.length === 0 && !loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-6xl mb-4 flex justify-center">
          <ICONS.Star className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No memes found</h3>
        <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Memes Grid */}
      <div className="grid gap-6">
        {memes.map((meme) => (
          <MemeCard
            key={meme.id}
            meme={meme}
            onLike={onLike}
            onShare={onShare}
            onComment={onComment}
            isLiked={likedMemes?.has(meme.slug) || false}
            className={layout === 'grid' ? 'lg:col-span-1' : ''}
          />
        ))}
      </div>

      {/* Intersection Observer Target for Infinite Scroll */}
      {showLoadMore && hasMore && (
        <div 
          ref={setObserverTarget}
          className="h-20 w-full flex items-center justify-center"
        >
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 dark:text-gray-400">Loading more memes...</span>
            </div>
          )}
        </div>
      )}

      {/* Fallback Load More Button (for cases where intersection observer might not work) */}
      {showLoadMore && hasMore && !loading && (
        <div className="text-center pt-6">
          <button
            onClick={onLoadMore}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
          >
            Load More
          </button>
        </div>
      )}

      {/* End of content indicator */}
      {!hasMore && memes.length > 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            You&apos;ve reached the end! No more memes in this category.
          </div>
        </div>
      )}
    </div>
  );
}; 