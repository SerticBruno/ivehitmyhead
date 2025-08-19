import { useEffect, useCallback, useMemo } from 'react';
import { useCategoriesState } from '@/lib/contexts';
import { Category } from '@/lib/types/meme';

interface UseCategoriesOptions {
  limit?: number;
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useCategories = (options: UseCategoriesOptions = {}): UseCategoriesReturn => {
  const { state, setCategories, setLoading, setError, refetch: refetchState } = useCategoriesState();
  
  // Memoize the limit to prevent unnecessary re-renders
  const limit = useMemo(() => options.limit || 50, [options.limit]);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        sort_by: 'name',
        sort_order: 'asc',
        limit: limit.toString()
      });

      const response = await fetch(`/api/categories?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCategories(data.categories);
      } else {
        throw new Error(data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching categories:', err);
    }
  }, [limit, setCategories, setLoading, setError]);

  // Only fetch categories if they haven't been loaded yet
  useEffect(() => {
    if (!state.isInitialized) {
      fetchCategories();
    }
  }, [fetchCategories, state.isInitialized]);

  const refetch = useCallback(() => {
    refetchState();
    fetchCategories();
  }, [refetchState, fetchCategories]);

  return {
    categories: state.categories,
    loading: state.loading,
    error: state.error,
    refetch
  };
};
