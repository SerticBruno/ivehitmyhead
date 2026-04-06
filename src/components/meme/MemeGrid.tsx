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
  emptyStateDescription,
}) => {
  const memeImageAreaStyle = {
    height: 'calc(100vh - 300px)',
    minHeight: '400px',
    maxHeight: '800px'
  };
  const previousMemeCountRef = React.useRef(0);

  // Preload only a tiny batch of newly appended images to avoid
  // saturating bandwidth/memory during infinite scroll.
  React.useEffect(() => {
    if (memes.length === 0) {
      previousMemeCountRef.current = 0;
      return;
    }

    const previousCount = previousMemeCountRef.current;
    const isListReset = memes.length < previousCount;
    const startIndex = isListReset ? 0 : previousCount;
    const endIndex = Math.min(memes.length, startIndex + 2);
    const nextBatch = memes.slice(startIndex, endIndex);
    previousMemeCountRef.current = memes.length;

    if (nextBatch.length > 0) {
      imagePreloader.preloadImages(
        nextBatch.map(meme => meme.image_url),
        { priority: 'low' }
      );
    }
  }, [memes]);

  // Set up infinite scroll
  const { setObserverTarget } = useInfiniteScroll({
    onLoadMore: onLoadMore || (() => {}),
    hasMore: hasMore && showLoadMore,
    loading,
    itemCount: memes.length,
    rootMargin: '800px' // Trigger loading when 800px from bottom
  });

  if (loading && memes.length === 0) {
    return (
      <div className={`grid gap-6 ${className}`}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-900 border-2 border-zinc-700 dark:border-zinc-400 shadow-[8px_8px_0px_rgba(0,0,0,0.85)] dark:shadow-[8px_8px_0px_rgba(156,163,175,0.42)] overflow-hidden rounded-none">
            <div className="px-6 pt-6 pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 w-1/2"></div>
                </div>
                <div className="w-24 flex-shrink-0">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            </div>
            <div
              className="bg-gray-200/90 dark:bg-gray-800 border-y-2 border-zinc-700 dark:border-zinc-400"
              style={memeImageAreaStyle}
            ></div>
            <div className="p-6 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700"></div>
                </div>
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700"></div>
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
        <h3 className="text-xl font-black uppercase tracking-wide mb-2">No memes found</h3>
        <p className="text-gray-500 dark:text-gray-400 mx-auto max-w-md">
          {emptyStateDescription ??
            'Loosen the filters or wait for someone else to post. Both are valid coping strategies.'}
        </p>
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
              <span className="text-gray-700 dark:text-gray-300 uppercase tracking-wide font-semibold">Loading more memes...</span>
            </div>
          )}
        </div>
      )}

      {/* Fallback Load More Button (for cases where intersection observer might not work) */}
      {showLoadMore && hasMore && !loading && (
        <div className="text-center pt-6">
          <button
            onClick={onLoadMore}
            className="px-8 py-3 bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200 font-black uppercase tracking-wide border-2 border-black dark:border-white rounded-none transition-colors duration-200"
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