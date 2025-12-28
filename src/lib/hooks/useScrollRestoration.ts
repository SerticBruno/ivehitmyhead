import { useEffect, useRef, useCallback } from 'react';

interface ScrollPosition {
  scrollY: number;
  timestamp: number;
}

interface InfiniteScrollState {
  page: number;
  loadedItems: number;
  scrollPosition: number;
  timestamp: number;
}

interface UseScrollRestorationOptions {
  // Unique identifier for this page/route combination
  pageKey?: string;
  // Whether to restore infinite scroll state
  restoreInfiniteScroll?: boolean;
  // Callback to restore infinite scroll data
  onRestoreInfiniteScroll?: (state: InfiniteScrollState) => void;
  // Debounce time for saving scroll position (ms)
  debounceMs?: number;
}

export const useScrollRestoration = (options: UseScrollRestorationOptions = {}) => {
  const {
    pageKey,
    restoreInfiniteScroll = true,
    onRestoreInfiniteScroll,
    debounceMs = 100
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isRestoringRef = useRef(false);

  // Generate a unique key for this page state
  const getPageKey = useCallback(() => {
    if (pageKey) return pageKey;
    
    // Create a key based on current URL
    if (typeof window !== 'undefined') {
      return window.location.pathname + window.location.search;
    }
    return 'default';
  }, [pageKey]);

  // Save scroll position and infinite scroll state
  const saveScrollState = useCallback((infiniteScrollState?: Partial<InfiniteScrollState>) => {
    if (isRestoringRef.current || typeof window === 'undefined') return;

    const key = getPageKey();
    const scrollPosition: ScrollPosition = {
      scrollY: window.scrollY,
      timestamp: Date.now()
    };

    // Save scroll position
    sessionStorage.setItem(`scroll_${key}`, JSON.stringify(scrollPosition));

    // Save infinite scroll state if provided
    if (restoreInfiniteScroll && infiniteScrollState) {
      const state: InfiniteScrollState = {
        page: infiniteScrollState.page || 1,
        loadedItems: infiniteScrollState.loadedItems || 0,
        scrollPosition: scrollPosition.scrollY,
        timestamp: scrollPosition.timestamp
      };
      sessionStorage.setItem(`infinite_${key}`, JSON.stringify(state));
    }
  }, [getPageKey, restoreInfiniteScroll]);

  // Restore scroll position and infinite scroll state
  const restoreScrollState = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const key = getPageKey();
    
    try {
      // Restore scroll position
      const scrollData = sessionStorage.getItem(`scroll_${key}`);
      if (scrollData) {
        const scrollPosition: ScrollPosition = JSON.parse(scrollData);
        const timeDiff = Date.now() - scrollPosition.timestamp;
        
        // Only restore if the saved position is recent (within 30 minutes)
        if (timeDiff < 30 * 60 * 1000) {
          isRestoringRef.current = true;
          
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            window.scrollTo(0, scrollPosition.scrollY);
            isRestoringRef.current = false;
          });
        } else {
          // Clean up old data
          sessionStorage.removeItem(`scroll_${key}`);
          sessionStorage.removeItem(`infinite_${key}`);
        }
      }

      // Restore infinite scroll state
      if (restoreInfiniteScroll && onRestoreInfiniteScroll) {
        const infiniteData = sessionStorage.getItem(`infinite_${key}`);
        if (infiniteData) {
          const state: InfiniteScrollState = JSON.parse(infiniteData);
          const timeDiff = Date.now() - state.timestamp;
          
          if (timeDiff < 30 * 60 * 1000) {
            onRestoreInfiniteScroll(state);
          } else {
            sessionStorage.removeItem(`infinite_${key}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore scroll state:', error);
      // Clean up corrupted data
      sessionStorage.removeItem(`scroll_${key}`);
      sessionStorage.removeItem(`infinite_${key}`);
    }
  }, [getPageKey, restoreInfiniteScroll, onRestoreInfiniteScroll]);

  // Debounced scroll position saving
  const debouncedSaveScroll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveScrollState();
    }, debounceMs);
  }, [saveScrollState, debounceMs]);

  // Save scroll position on scroll events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      debouncedSaveScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedSaveScroll]);

  // Save scroll position before navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      saveScrollState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScrollState();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveScrollState]);

  // Restore scroll position when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Small delay to ensure the page is fully rendered
    const timer = setTimeout(() => {
      restoreScrollState();
    }, 100);

    return () => clearTimeout(timer);
  }, [restoreScrollState]);

  // Clean up old scroll data when component unmounts
  useEffect(() => {
    return () => {
      if (typeof window === 'undefined') return;

      // Clean up old data (older than 1 hour) for all keys
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('scroll_') || key.startsWith('infinite_'))) {
          try {
            const data = JSON.parse(sessionStorage.getItem(key)!);
            if (now - data.timestamp > 60 * 60 * 1000) { // 1 hour
              keysToRemove.push(key);
            }
          } catch {
            // Remove corrupted data
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    };
  }, []);

  return {
    saveScrollState,
    restoreScrollState,
    getPageKey
  };
};
