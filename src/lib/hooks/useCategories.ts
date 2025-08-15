import { useState, useEffect, useCallback } from 'react';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(options.limit || 50);

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
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchCategories();
  }, [limit, fetchCategories]);

  const refetch = () => {
    fetchCategories();
  };

  return {
    categories,
    loading,
    error,
    refetch
  };
};
