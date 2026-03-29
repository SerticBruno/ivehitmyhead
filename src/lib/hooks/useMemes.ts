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
  /** Drops stale fetch responses (e.g. all-memes request finishing after session restores category). */
  const fetchGenerationRef = useRef(0);

  const {
    state,
    setMemes,
    appendMemes,
    setHasMore,
    setCurrentPage,
  } = useMemesState();

  const {
    category_id,
    search,
    sort_by = 'created_at',
    sort_order = 'desc',
    time_period,
    limit = 20
  } = options;

  const querySignature = useMemo(
    () =>
      JSON.stringify({
        cat: category_id || '',
        tp: time_period || 'all',
        sb: sort_by,
        so: sort_order,
        se: search || '',
        lim: limit,
      }),
    [category_id, time_period, sort_by, sort_order, search, limit]
  );

  const fetchMemes = useCallback(async (pageNum: number, append: boolean = false) => {
    const requestGeneration = append
      ? fetchGenerationRef.current
      : ++fetchGenerationRef.current;

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

      if (requestGeneration !== fetchGenerationRef.current) {
        return;
      }

      if (append) {
        appendMemes(data.memes);
      } else {
        setMemes(data.memes);
      }

      setHasMore(data.pagination?.has_more || false);
      setCurrentPage(pageNum);
    } catch (err) {
      if (requestGeneration === fetchGenerationRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch memes');
      }
    } finally {
      if (append) {
        setLoading(false);
      } else if (requestGeneration === fetchGenerationRef.current) {
        setLoading(false);
      }
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

  // Filters are owned by MemesStateContext (sidebar / session restore).
  // Refetch whenever API query params change so session-restored filters match the list.

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchMemes(1, false);
  }, [querySignature, fetchMemes, setCurrentPage, setHasMore]);

  return {
    memes: state.memes,
    loading,
    error,
    hasMore: state.hasMore,
    loadMore,
    refresh
  };
};
