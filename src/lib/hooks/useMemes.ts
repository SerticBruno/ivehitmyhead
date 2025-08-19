import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
      console.log('fetchMemes called:', {
        pageNum,
        append,
        category_id,
        search,
        sort_by,
        sort_order,
        time_period,
        limit
      });
      
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

      console.log('API request params:', params.toString());

      const response = await fetch(`/api/memes?${params}`);
      
      if (!response.ok) {
        console.error('API response not ok:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        throw new Error(`Failed to fetch memes: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('API response:', {
        memeCount: data.memes?.length || 0,
        hasMore: data.pagination?.has_more,
        append,
        pageNum,
        currentFilters,
        responseStatus: response.status,
        pagination: data.pagination
      });
      
      if (append) {
        console.log('Appending memes to existing list');
        appendMemes(data.memes);
        console.log('appendMemes called, checking state after update...');
        // Add a small delay to check the state after the update
        setTimeout(() => {
          console.log('State after appendMemes:', {
            memes: state.memes,
            hasMore: state.hasMore,
            currentPage: state.currentPage
          });
        }, 100);
      } else {
        console.log('Setting new memes list');
        setMemes(data.memes);
      }
      
      console.log('Setting hasMore to:', data.pagination?.has_more);
      setHasMore(data.pagination?.has_more || false);
      setCurrentPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch memes');
    } finally {
      setLoading(false);
    }
  }, [category_id, search, sort_by, sort_order, time_period, limit, setMemes, appendMemes, setHasMore, setCurrentPage, state.memes, state.hasMore, state.currentPage]);

  const loadMore = useCallback(() => {
    console.log('loadMore called:', {
      loading,
      hasMore: state.hasMore,
      currentPage: state.currentPage,
      memeCount: state.memes.length,
      currentFilters,
      contextFilters: state.filters
    });
    
    // Check if we can actually load more
    if (!loading && state.hasMore && state.memes.length > 0) {
      const nextPage = state.currentPage + 1;
      console.log('Loading more memes, page:', nextPage);
      console.log('About to call fetchMemes with append: true');
      fetchMemes(nextPage, true);
    } else {
      console.log('loadMore blocked:', {
        loading,
        hasMore: state.hasMore,
        memeCount: state.memes.length,
        reason: loading ? 'Currently loading' : !state.hasMore ? 'No more memes available' : 'No memes loaded yet'
      });
    }
  }, [loading, state.hasMore, state.currentPage, state.memes.length, fetchMemes, currentFilters, state.filters]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    setMemes([]);
    setHasMore(true);
    fetchMemes(1, false);
  }, [fetchMemes, setCurrentPage, setMemes, setHasMore]);

  // Initialize state when we have existing memes but not initialized
  const initializeExistingState = useCallback(() => {
    if (state.memes.length > 0 && !state.isInitialized) {
      console.log('Initializing existing state with memes:', state.memes.length);
      const calculatedPage = Math.ceil(state.memes.length / 7);
      setCurrentPage(calculatedPage);
      // Set loading to false since we have memes and don't need to fetch
      setLoading(false);
      // Don't change hasMore or memes since they're already correct
    }
  }, [state.memes.length, state.isInitialized, setCurrentPage]);

  // Update filters in context when options change
  useEffect(() => {
    console.log('useMemes: Updating filters in context:', currentFilters);
    // Always update filters when they change
    setFilters(currentFilters);
  }, [currentFilters, setFilters]);

  // Initialize existing state when component mounts
  useEffect(() => {
    initializeExistingState();
    // Also set loading to false immediately if we have memes
    if (state.memes.length > 0) {
      console.log('Setting loading to false on mount since we have memes');
      setLoading(false);
    }
  }, [initializeExistingState, state.memes.length]);

  // Manage loading state when we have existing memes
  useEffect(() => {
    if (state.memes.length > 0 && loading) {
      console.log('Setting loading to false since we have existing memes');
      setLoading(false);
    }
  }, [state.memes.length, loading]);

  // Set loading to false immediately if we have memes and are initialized
  useEffect(() => {
    if (state.isInitialized && state.memes.length > 0 && loading) {
      console.log('Setting loading to false - we have initialized memes');
      setLoading(false);
    }
  }, [state.isInitialized, state.memes.length, loading]);

  // Fetch memes when context state changes
  useEffect(() => {
    console.log('useMemes: Context state changed:', {
      isInitialized: state.isInitialized,
      currentFilters,
      contextFilters: state.filters,
      existingMemeCount: state.memes.length
    });
    
    // Only fetch if we're not initialized AND we don't have any memes
    // This prevents unnecessary loading when returning from single meme page
    if (!state.isInitialized && state.memes.length === 0) {
      console.log('useMemes: Context not initialized and no memes, fetching memes with filters:', currentFilters);
      setCurrentPage(1);
      setMemes([]);
      setHasMore(true);
      fetchMemes(1, false);
    } else if (!state.isInitialized && state.memes.length > 0) {
      console.log('useMemes: Context not initialized but we have memes, initializing existing state');
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
