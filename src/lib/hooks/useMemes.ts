import { useState, useEffect, useCallback, useMemo } from 'react';
import { Meme } from '@/lib/types/meme';
import { useMemesState } from '@/lib/contexts';

interface UseMemesOptions {
  category_id?: string;
  search?: string;
  sort_by?: 'created_at' | 'likes' | 'views' | 'comments';
  sort_order?: 'asc' | 'desc';
  time_period?: 'all' | 'today' | 'week' | 'month';
  limit?: number;
}

interface UseMemesReturn {
  memes: Meme[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export const useMemes = (options: UseMemesOptions = {}): UseMemesReturn => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    state,
    setMemes,
    appendMemes,
    setHasMore,
    setCurrentPage,
    setFilters
  } = useMemesState();

  const {
    category_id,
    search,
    sort_by = 'created_at',
    sort_order = 'desc',
    time_period,
    limit = 20
  } = options;

  // Memoize current filters to prevent unnecessary re-renders
  const currentFilters = useMemo(() => ({
    category_id: category_id || '',
    filter: sort_by === 'likes' ? 'hottest' as const : 
            sort_by === 'views' ? 'trending' as const : 'newest' as const,
    time_period: time_period || 'all'
  }), [category_id, sort_by, time_period]);

  const fetchMemes = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        sort_by,
        sort_order
      });

      if (category_id) {
        params.append('category_id', category_id);
      }

      if (search) {
        params.append('search', search);
      }

      if (time_period) {
        params.append('time_period', time_period);
      }

      const response = await fetch(`/api/memes?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch memes: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (append) {
        appendMemes(data.memes);
      } else {
        setMemes(data.memes);
      }
      
      setHasMore(data.pagination?.has_more || false);
      setCurrentPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch memes');
    } finally {
      setLoading(false);
    }
  }, [category_id, search, sort_by, sort_order, time_period, limit, setMemes, appendMemes, setHasMore, setCurrentPage]);

  const loadMore = useCallback(() => {
    // Check if we can actually load more
    if (!loading && state.hasMore && state.memes.length > 0) {
      const nextPage = state.currentPage + 1;
      fetchMemes(nextPage, true);
    }
  }, [loading, state.hasMore, state.currentPage, state.memes.length, fetchMemes]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    setMemes([]);
    setHasMore(true);
    fetchMemes(1, false);
  }, [fetchMemes, setCurrentPage, setMemes, setHasMore]);

  // Initialize state when we have existing memes but not initialized
  const initializeExistingState = useCallback(() => {
    if (state.memes.length > 0 && !state.isInitialized) {
      const calculatedPage = Math.ceil(state.memes.length / 7);
      setCurrentPage(calculatedPage);
      // Set loading to false since we have memes and don't need to fetch
      setLoading(false);
      // Don't change hasMore or memes since they're already correct
    }
  }, [state.memes.length, state.isInitialized, setCurrentPage]);

  // Update filters in context when options change
  useEffect(() => {
    // Always update filters when they change
    setFilters(currentFilters);
  }, [currentFilters, setFilters]);

  // Initialize existing state when component mounts
  useEffect(() => {
    initializeExistingState();
    // Also set loading to false immediately if we have memes
    if (state.memes.length > 0) {
      setLoading(false);
    }
  }, [initializeExistingState, state.memes.length]);

  // Manage loading state when we have existing memes
  useEffect(() => {
    if (state.memes.length > 0 && loading) {
      setLoading(false);
    }
  }, [state.memes.length, loading]);

  // Set loading to false immediately if we have memes and are initialized
  useEffect(() => {
    if (state.isInitialized && state.memes.length > 0 && loading) {
      setLoading(false);
    }
  }, [state.isInitialized, state.memes.length, loading]);

  // Fetch memes when context state changes
  useEffect(() => {
    // Only fetch if we're not initialized AND we don't have any memes
    // This prevents unnecessary loading when returning from single meme page
    if (!state.isInitialized && state.memes.length === 0) {
      setCurrentPage(1);
      setMemes([]);
      setHasMore(true);
      fetchMemes(1, false);
    } else if (!state.isInitialized && state.memes.length > 0) {
      // We have memes but not initialized, just initialize the state
      initializeExistingState();
    }
  }, [state.isInitialized, state.memes.length, currentFilters, setCurrentPage, setMemes, setHasMore, fetchMemes, initializeExistingState]);

  return {
    memes: state.memes,
    loading,
    error,
    hasMore: state.hasMore,
    loadMore,
    refresh
  };
};
