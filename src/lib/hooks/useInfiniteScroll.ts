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
  rootMargin = '500px', // Increased from 300px to 500px to trigger much sooner
  batchSize = 5,
  itemCount
}: UseInfiniteScrollOptions) => {
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasCheckedInitialPosition = useRef(false);

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

  // Check if we need to load more when the component mounts or when hasMore changes
  useEffect(() => {
    if (hasMore && !loading && itemCount > 0 && !hasCheckedInitialPosition.current) {
      hasCheckedInitialPosition.current = true;
      
      // Check if we're already near the bottom of the page
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800;
      
      if (isNearBottom) {
        console.log('Already near bottom of page, triggering load more');
        // Small delay to ensure the page is fully rendered
        setTimeout(() => {
          onLoadMore();
        }, 100);
      }
    }
  }, [hasMore, loading, itemCount, onLoadMore]);

  // Add scroll event listener to detect when user scrolls near bottom
  useEffect(() => {
    if (!hasMore || loading) return;

    const handleScroll = () => {
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500;
      
      if (isNearBottom && hasMore && !loading) {
        console.log('Scrolled near bottom, triggering load more');
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, onLoadMore]);

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
