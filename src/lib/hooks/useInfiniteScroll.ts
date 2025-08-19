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
  rootMargin = '800px', // Increased to 800px to trigger much sooner
  itemCount
}: UseInfiniteScrollOptions) => {
  const [observerTarget, setObserverTarget] = useState<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasCheckedInitialPosition = useRef(false);
  const lastLoadMoreTime = useRef(0);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        // Prevent rapid firing of load more
        const now = Date.now();
        if (now - lastLoadMoreTime.current > 1000) { // Minimum 1 second between loads
          lastLoadMoreTime.current = now;
          console.log('Intersection observer triggered load more');
          onLoadMore();
        }
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
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800;
      
      if (isNearBottom && hasMore && !loading) {
        // Prevent rapid firing of load more
        const now = Date.now();
        if (now - lastLoadMoreTime.current > 1000) { // Minimum 1 second between loads
          lastLoadMoreTime.current = now;
          console.log('Scrolled near bottom, triggering load more');
          onLoadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, onLoadMore]);

  // Additional check for when items are added (useful for scroll restoration scenarios)
  useEffect(() => {
    if (hasMore && !loading && itemCount > 0) {
      // Check if we're near the bottom after items are added
      const isNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800;
      
      if (isNearBottom) {
        console.log('Items added, checking if we need to load more');
        // Small delay to ensure the DOM is updated
        setTimeout(() => {
          const newIsNearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800;
          if (newIsNearBottom && hasMore && !loading) {
            console.log('Still near bottom after items added, triggering load more');
            onLoadMore();
          }
        }, 200);
      }
    }
  }, [itemCount, hasMore, loading, onLoadMore]);

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
