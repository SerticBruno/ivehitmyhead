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
        throw new Error(`Failed to fetch memes: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('API response:', {
        memeCount: data.memes?.length || 0,
        hasMore: data.pagination?.has_more,
        append
      });
      
      if (append) {
        appendMemes(data.memes);
      } else {
        setMemes(data.memes);
      }
      
      setHasMore(data.pagination.has_more);
      setCurrentPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch memes');
    } finally {
      setLoading(false);
    }
  }, [category_id, search, sort_by, sort_order, time_period, limit, setMemes, appendMemes, setHasMore, setCurrentPage]);

  const loadMore = useCallback(() => {
    if (!loading && state.hasMore) {
      fetchMemes(state.currentPage + 1, true);
    }
  }, [loading, state.hasMore, state.currentPage, fetchMemes]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    setMemes([]);
    setHasMore(true);
    fetchMemes(1, false);
  }, [fetchMemes, setCurrentPage, setMemes, setHasMore]);

  // Update filters in context when options change
  useEffect(() => {
    console.log('useMemes: Updating filters in context:', currentFilters);
    // Always update filters when they change
    setFilters(currentFilters);
  }, [currentFilters, setFilters]);

  // Fetch memes when context state changes
  useEffect(() => {
    console.log('useMemes: Context state changed:', {
      isInitialized: state.isInitialized,
      currentFilters,
      contextFilters: state.filters
    });
    
    // If we're not initialized, fetch memes
    if (!state.isInitialized) {
      console.log('useMemes: Context not initialized, fetching memes with filters:', currentFilters);
      setCurrentPage(1);
      setMemes([]);
      setHasMore(true);
      fetchMemes(1, false);
    }
  }, [state.isInitialized, currentFilters, setCurrentPage, setMemes, setHasMore, fetchMemes]);

  return {
    memes: state.memes,
    loading,
    error,
    hasMore: state.hasMore,
    loadMore,
    refresh
  };
};
