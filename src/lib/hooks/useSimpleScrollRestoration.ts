import { useEffect, useRef, useCallback } from 'react';

interface ScrollState {
  scrollY: number;
  timestamp: number;
}

export const useSimpleScrollRestoration = (pageKey: string) => {
  const isRestoringRef = useRef(false);

  // Save scroll position
  const saveScrollPosition = useCallback(() => {
    if (isRestoringRef.current || typeof window === 'undefined') return;

    const scrollState: ScrollState = {
      scrollY: window.scrollY,
      timestamp: Date.now()
    };

    sessionStorage.setItem(`scroll_${pageKey}`, JSON.stringify(scrollState));
  }, [pageKey]);

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const scrollData = sessionStorage.getItem(`scroll_${pageKey}`);
      if (scrollData) {
        const scrollState: ScrollState = JSON.parse(scrollData);
        const timeDiff = Date.now() - scrollState.timestamp;
        
        // Only restore if the saved position is recent (within 30 minutes)
        if (timeDiff < 30 * 60 * 1000) {
          isRestoringRef.current = true;
          
          // Use requestAnimationFrame to ensure DOM is ready
          requestAnimationFrame(() => {
            window.scrollTo(0, scrollState.scrollY);
            isRestoringRef.current = false;
          });
        } else {
          // Clean up old data
          sessionStorage.removeItem(`scroll_${pageKey}`);
        }
      }
    } catch (error) {
      console.error('Failed to restore scroll position:', error);
      sessionStorage.removeItem(`scroll_${pageKey}`);
    }
  }, [pageKey]);

  // Save scroll position on scroll events (debounced)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveScrollPosition();
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [saveScrollPosition]);

  // Save scroll position before navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScrollPosition();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveScrollPosition]);

  // Restore scroll position when component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      restoreScrollPosition();
    }, 100);

    return () => clearTimeout(timer);
  }, [restoreScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition
  };
};
