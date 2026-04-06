import { useEffect, useCallback, useRef, useState } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  threshold?: number;
  rootMargin?: string;
  itemCount: number; // Current number of items loaded
}

export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  loading,
  threshold = 0.1,
  rootMargin = '800px',
  itemCount
}: UseInfiniteScrollOptions) => {
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastLoadMoreTime = useRef(0);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading && itemCount > 0) {
        const now = Date.now();
        if (now - lastLoadMoreTime.current > 1000) {
          lastLoadMoreTime.current = now;
          onLoadMore();
        }
      }
    },
    [onLoadMore, hasMore, loading, itemCount]
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
