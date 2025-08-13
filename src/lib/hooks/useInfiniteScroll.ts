import { useEffect, useCallback, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
  rootMargin?: string;
  batchSize?: number; // Size of each batch (e.g., 5 memes per batch)
  itemCount: number; // Current number of items loaded
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  loading,
  threshold = 0.1,
  rootMargin = '100px',
  batchSize = 5, // Default: 5 items per batch
  itemCount
}: UseInfiniteScrollOptions) => {
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        // Calculate how many items are in the current batch
        const currentBatchSize = itemCount % batchSize || batchSize;
        
        // Only trigger if we're near the end of the current batch
        // Trigger when we have at least 2 items in the current batch
        // and we're near the end (within 1-2 items of the batch end)
        if (currentBatchSize >= 2 && currentBatchSize >= batchSize - 1) {
          onLoadMore();
        }
      }
    },
    [onLoadMore, hasMore, loading, itemCount, batchSize]
  );

  useEffect(() => {
    if (!observerTarget) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(observerTarget);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [observerTarget, handleObserver, threshold, rootMargin]);

  return { setObserverTarget };
};
