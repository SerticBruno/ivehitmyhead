import { useState, useEffect, useCallback } from 'react';
import { Meme } from '@/lib/types/meme';

interface UseMemesOptions {
  categoryId?: string;
  search?: string;
  sortBy?: 'created_at' | 'likes' | 'views' | 'comments';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

interface UseMemesReturn {
  memes: Meme[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  setFilters: (filters: Partial<UseMemesOptions>) => void;
}

export const useMemes = (options: UseMemesOptions = {}): UseMemesReturn => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFiltersState] = useState(options);

  const fetchMemes = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: (filters.limit || 20).toString(),
        sort_by: filters.sortBy || 'created_at',
        sort_order: filters.sortOrder || 'desc'
      });

      if (filters.categoryId) {
        params.append('category_id', filters.categoryId);
      }

      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await fetch(`/api/memes?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch memes');
      }

      const data = await response.json();
      
      if (append) {
        setMemes(prev => [...prev, ...data.memes]);
      } else {
        setMemes(data.memes);
      }
      
      setHasMore(data.pagination.has_more);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch memes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMemes(nextPage, true);
    }
  }, [loading, hasMore, page, fetchMemes]);

  const refresh = useCallback(() => {
    setPage(1);
    setHasMore(true);
    fetchMemes(1, false);
  }, [fetchMemes]);

  const setFilters = useCallback((newFilters: Partial<UseMemesOptions>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setPage(1);
    setHasMore(true);
  }, []);

  // Fetch memes when filters change
  useEffect(() => {
    fetchMemes(1, false);
  }, [filters, fetchMemes]);

  return {
    memes,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    setFilters
  };
};
