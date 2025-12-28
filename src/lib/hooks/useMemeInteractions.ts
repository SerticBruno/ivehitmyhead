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

      console.log('useMemeInteractions: Attempting to like meme:', memeSlug);

      const response = await fetch(`/api/memes/${memeSlug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
      });

      console.log('useMemeInteractions: Response status:', response.status);
      console.log('useMemeInteractions: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        // Try to get the response text first
        const responseText = await response.text();
        console.error('useMemeInteractions: Error response text:', responseText);
        
        let errorData: any = {};
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('useMemeInteractions: Failed to parse error response as JSON:', parseError);
          errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` };
        }
        
        console.error('useMemeInteractions: Error response data:', errorData);
        const errorMessage = errorData.error || errorData.details || `Failed to like meme: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      console.log('useMemeInteractions: Response text:', responseText);
      
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('useMemeInteractions: Failed to parse success response as JSON:', parseError);
        throw new Error('Invalid response from server');
      }
      
      console.log('useMemeInteractions: Like response data:', data);
      return data.liked ?? false;
    } catch (err) {
      console.error('useMemeInteractions: Exception caught:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to like meme';
      setError(errorMessage);
      console.error('useMemeInteractions: Setting error state:', errorMessage);
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
  }, []); // Empty dependency array ensures this function is stable

  return {
    likeMeme,
    commentOnMeme,
    recordView,
    loading,
    error
  };
};
