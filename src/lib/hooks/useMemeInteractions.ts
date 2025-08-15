import { useState, useCallback } from 'react';
import { MemeComment } from '@/lib/types/meme';

interface UseMemeInteractionsReturn {
  likeMeme: (memeSlug: string) => Promise<boolean>;
  commentOnMeme: (memeId: string, content: string, parentId?: string) => Promise<MemeComment | null>;
  recordView: (memeId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useMemeInteractions = (): UseMemeInteractionsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const likeMeme = useCallback(async (memeSlug: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/memes/${memeSlug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like meme');
      }

      const data = await response.json();
      return data.liked;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like meme');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const commentOnMeme = useCallback(async (
    memeId: string, 
    content: string, 
    parentId?: string
  ): Promise<MemeComment | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/memes/${memeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          parent_id: parentId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const data = await response.json();
      return data.comment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordView = useCallback(async (memeSlug: string): Promise<void> => {
    try {
      // Don't set loading for views as it's not user-initiated
      await fetch(`/api/memes/${memeSlug}/view`, {
        method: 'POST',
      });
    } catch (err) {
      // Silently fail for views - don't show error to user
      console.error('Failed to record view:', err);
    }
  }, []);

  return {
    likeMeme,
    commentOnMeme,
    recordView,
    loading,
    error
  };
};
