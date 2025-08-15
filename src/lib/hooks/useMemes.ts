import { useState, useEffect, useCallback } from 'react';
import { Meme } from '@/lib/types/meme';

interface UseMemesOptions {
  category_id?: string;
  search?: string;
  sort_by?: 'created_at' | 'likes' | 'views' | 'comments';
  sort_order?: 'asc' | 'desc';
  secondary_sort?: 'created_at' | 'likes' | 'views' | 'comments';
  secondary_order?: 'asc' | 'desc';
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
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const {
    category_id,
    search,
    sort_by = 'created_at',
    sort_order = 'desc',
    secondary_sort,
    secondary_order,
    time_period,
    limit = 20
  } = options;

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

      if (secondary_sort) {
        params.append('secondary_sort', secondary_sort);
        params.append('secondary_order', secondary_order || 'desc');
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
        setMemes(prev => [...prev, ...data.memes]);
      } else {
        setMemes(data.memes);
      }
      
      setTotalCount(data.pagination.total);
      setHasMore(data.pagination.has_more);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch memes');
    } finally {
      setLoading(false);
    }
  }, [category_id, search, sort_by, sort_order, secondary_sort, secondary_order, time_period, limit]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchMemes(page + 1, true);
    }
  }, [loading, hasMore, page, fetchMemes]);

  const refresh = useCallback(() => {
    setPage(1);
    setMemes([]);
    setHasMore(true);
    fetchMemes(1, false);
  }, [fetchMemes]);

  // Fetch memes when options change
  useEffect(() => {
    setPage(1);
    setMemes([]);
    setHasMore(true);
    fetchMemes(1, false);
  }, [fetchMemes]);

  return {
    memes,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};
