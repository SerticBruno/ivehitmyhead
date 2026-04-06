import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Meme } from '@/lib/types/meme';
import { useMemesListState } from '@/lib/contexts';

interface UseMemesOptions {
  category_id?: string;
  search?: string;
  sort_by?: 'created_at' | 'likes' | 'views' | 'comments';
  sort_order?: 'asc' | 'desc';
  time_period?: 'all' | 'today' | 'week' | 'month';
  limit?: number;
  mode?: 'default' | 'random';
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
  const isFetchingMoreRef = useRef(false);
  const randomSeenIdsRef = useRef<Set<string>>(new Set());

  const {
    memes,
    hasMore,
    currentPage,
    queryKey,
    setMemes,
    appendMemes,
    setHasMore,
    setCurrentPage,
    setQueryKey,
  } = useMemesListState();

  const {
    category_id,
    search,
    sort_by = 'created_at',
    sort_order = 'desc',
    time_period,
    limit = 20,
    mode = 'default'
  } = options;
  const isRandomMode = mode === 'random';

  const querySignature = useMemo(
    () =>
      JSON.stringify({
        cat: category_id || '',
        tp: time_period || 'all',
        sb: sort_by,
        so: sort_order,
        se: search || '',
        lim: limit,
        md: mode,
      }),
    [category_id, time_period, sort_by, sort_order, search, limit, mode]
  );

  useEffect(() => {
    // Keep random exclusions in-memory only so opening /random starts fresh.
    // This preserves non-duplicate behavior during one page session.
    randomSeenIdsRef.current.clear();
  }, [isRandomMode, querySignature]);

  const fetchMemes = useCallback(async (pageNum: number, append: boolean = false) => {
    if (append) {
      if (isFetchingMoreRef.current) {
        return;
      }
      isFetchingMoreRef.current = true;
    }

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

      if (isRandomMode) {
        params.append('mode', 'random');
        const seenIds = [...randomSeenIdsRef.current].slice(0, 200);
        if (seenIds.length > 0) {
          params.append('exclude_ids', seenIds.join(','));
        }
      }

      const response = await fetch(`/api/memes?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch memes: ${response.statusText}`);
      }

      const data = await response.json();
      const responseMemes = Array.isArray(data.memes) ? data.memes : [];

      if (requestGeneration !== fetchGenerationRef.current) {
        return;
      }

      if (isRandomMode) {
        for (const meme of responseMemes) {
          if (meme?.id) {
            randomSeenIdsRef.current.add(meme.id);
          }
        }
      }

      if (append) {
        appendMemes(responseMemes);
      } else {
        setMemes(responseMemes);
      }

      setQueryKey(querySignature);
      setHasMore(data.pagination?.has_more || false);
      setCurrentPage(pageNum);
    } catch (err) {
      if (requestGeneration === fetchGenerationRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch memes');
      }
    } finally {
      if (append) {
        isFetchingMoreRef.current = false;
      }
      if (append) {
        setLoading(false);
      } else if (requestGeneration === fetchGenerationRef.current) {
        setLoading(false);
      }
    }
  }, [category_id, search, sort_by, sort_order, time_period, limit, isRandomMode, setMemes, appendMemes, setHasMore, setCurrentPage, setQueryKey, querySignature]);

  const loadMore = useCallback(() => {
    if (!loading && !isFetchingMoreRef.current && hasMore && memes.length > 0) {
      const nextPage = currentPage + 1;
      fetchMemes(nextPage, true);
    }
  }, [loading, hasMore, currentPage, memes.length, fetchMemes]);

  const refresh = useCallback(() => {
    if (isRandomMode) {
      randomSeenIdsRef.current.clear();
    }
    setCurrentPage(1);
    setMemes([]);
    setHasMore(true);
    fetchMemes(1, false);
  }, [fetchMemes, isRandomMode, setCurrentPage, setMemes, setHasMore]);

  // Filters are owned by MemesStateContext (sidebar / session restore).
  // Refetch whenever API query params change so session-restored filters match the list.

  useEffect(() => {
    const hasMatchingCachedList = queryKey === querySignature && memes.length > 0;

    if (hasMatchingCachedList) {
      setLoading(false);
      setError(null);
      return;
    }

    // Prevent showing stale list data from a different query/page mode.
    setMemes([]);
    setCurrentPage(1);
    setHasMore(true);
    fetchMemes(1, false);
  }, [querySignature, queryKey, memes.length, fetchMemes, setCurrentPage, setHasMore, setMemes]);

  return {
    memes,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};
