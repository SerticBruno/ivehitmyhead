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
  rootMargin = '500px' // Increased from 300px to 500px to trigger much sooner
}: UseInfiniteScrollOptions) => {
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        // Simplified logic: trigger load more when the observer target is visible
        // and we're not currently loading and there are more items
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, loading]
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
