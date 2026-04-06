'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { Meme } from '@/lib/types/meme';

interface MemesState {
  memes: Meme[];
  hasMore: boolean;
  currentPage: number;
  queryKey: string;
  scrollPosition: number;
  filters: {
    category_id: string;
    filter: 'newest' | 'trending' | 'hottest';
    time_period: 'all' | 'today' | 'week' | 'month';
  };
  isInitialized: boolean;
}

/** List slice + mutators: subscribers do not re-render when only filters/scroll change. */
export interface MemesListStateContextType {
  memes: Meme[];
  hasMore: boolean;
  currentPage: number;
  queryKey: string;
  setMemes: (memes: Meme[]) => void;
  appendMemes: (memes: Meme[]) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setQueryKey: (queryKey: string) => void;
  updateMemeLikeCount: (memeSlug: string, newLikeCount: number) => void;
  updateMemeShareCount: (memeSlug: string, newShareCount: number) => void;
  updateMemeLikedState: (memeSlug: string, isLiked: boolean) => void;
}

/** UI slice + mutators: subscribers do not re-render when only memes / pagination change. */
export interface MemesUIStateContextType {
  filters: MemesState['filters'];
  scrollPosition: number;
  isInitialized: boolean;
  setScrollPosition: (position: number) => void;
  setFilters: (filters: Partial<MemesState['filters']>) => void;
  resetState: () => void;
  isSameFilters: (filters: Partial<MemesState['filters']>) => boolean;
}

/** @deprecated Prefer useMemesUIState / useMemesListState to avoid unnecessary re-renders. */
interface MemesStateContextType extends MemesListStateContextType, MemesUIStateContextType {
  state: MemesState;
}

const initialState: MemesState = {
  memes: [],
  hasMore: false,
  currentPage: 1,
  queryKey: '',
  scrollPosition: 0,
  filters: {
    category_id: '',
    filter: 'newest',
    time_period: 'all'
  },
  isInitialized: false
};

function normalizeMemesStateSnapshot(raw: unknown): MemesState {
  if (!raw || typeof raw !== 'object') {
    return initialState;
  }
  const p = raw as Partial<MemesState>;
  const f = p.filters && typeof p.filters === 'object' ? p.filters : {};
  return {
    ...initialState,
    ...p,
    memes: Array.isArray(p.memes) ? p.memes : initialState.memes,
    filters: {
      ...initialState.filters,
      category_id:
        typeof (f as MemesState['filters']).category_id === 'string'
          ? (f as MemesState['filters']).category_id
          : initialState.filters.category_id,
      filter:
        (f as MemesState['filters']).filter === 'hottest' ||
        (f as MemesState['filters']).filter === 'trending' ||
        (f as MemesState['filters']).filter === 'newest'
          ? (f as MemesState['filters']).filter
          : initialState.filters.filter,
      time_period:
        (f as MemesState['filters']).time_period === 'today' ||
        (f as MemesState['filters']).time_period === 'week' ||
        (f as MemesState['filters']).time_period === 'month' ||
        (f as MemesState['filters']).time_period === 'all'
          ? (f as MemesState['filters']).time_period
          : initialState.filters.time_period,
    },
    hasMore: typeof p.hasMore === 'boolean' ? p.hasMore : initialState.hasMore,
    currentPage: typeof p.currentPage === 'number' && p.currentPage >= 1 ? p.currentPage : initialState.currentPage,
    queryKey: typeof p.queryKey === 'string' ? p.queryKey : initialState.queryKey,
    scrollPosition: typeof p.scrollPosition === 'number' ? p.scrollPosition : initialState.scrollPosition,
    isInitialized: typeof p.isInitialized === 'boolean' ? p.isInitialized : initialState.isInitialized,
  };
}

const MemesListStateContext = createContext<MemesListStateContextType | undefined>(undefined);
const MemesUIStateContext = createContext<MemesUIStateContextType | undefined>(undefined);

const MemesStateContext = createContext<MemesStateContextType | undefined>(undefined);

export const useMemesListState = () => {
  const context = useContext(MemesListStateContext);
  if (!context) {
    throw new Error('useMemesListState must be used within a MemesStateProvider');
  }
  return context;
};

export const useMemesUIState = () => {
  const context = useContext(MemesUIStateContext);
  if (!context) {
    throw new Error('useMemesUIState must be used within a MemesStateProvider');
  }
  return context;
};

export const useMemesState = () => {
  const context = useContext(MemesStateContext);
  if (!context) {
    throw new Error('useMemesState must be used within a MemesStateProvider');
  }
  return context;
};

interface MemesStateProviderProps {
  children: React.ReactNode;
}

export const MemesStateProvider: React.FC<MemesStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<MemesState>(initialState);
  const isInitialMount = useRef(true);
  const lastSavedState = useRef<string>('');

  // Restore filters + list from session before child useEffects (e.g. /memes fetch) run.
  useLayoutEffect(() => {
    const savedState = sessionStorage.getItem('memesState');

    if (savedState) {
      try {
        const parsedState = normalizeMemesStateSnapshot(JSON.parse(savedState));
        const normalizedJson = JSON.stringify(parsedState);
        setState(parsedState);
        lastSavedState.current = normalizedJson;
      } catch (error) {
        console.error('Failed to parse saved memes state:', error);
      }
    }
  }, []);

  // Save state to sessionStorage whenever it changes - with debouncing
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialMount.current) {
      const currentState = JSON.stringify(state);
      if (currentState !== lastSavedState.current) {
        lastSavedState.current = currentState;
        sessionStorage.setItem('memesState', currentState);
      }
    }
    isInitialMount.current = false;
  }, [state]);

  // Save scroll position before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (typeof window !== 'undefined') {
        const stateToSave = {
          ...state,
          scrollPosition: window.scrollY
        };
        sessionStorage.setItem('memesState', JSON.stringify(stateToSave));
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleBeforeUnload();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state]);

  const setMemes = useCallback((memes: Meme[]) => {
    setState(prev => {
      // Remove duplicates from the new memes array
      const uniqueMemes = memes.filter((meme, index, self) => 
        index === self.findIndex(m => m.id === meme.id)
      );
      
      if (uniqueMemes.length !== memes.length) {
        console.warn(`setMemes: Filtered out ${memes.length - uniqueMemes.length} duplicate memes`);
      }
      
      return { ...prev, memes: uniqueMemes, isInitialized: true };
    });
  }, []);

  const appendMemes = useCallback((memes: Meme[]) => {
    setState(prev => {
      // Always deduplicate when appending to prevent duplicates
      const existingMemeIds = new Set(prev.memes.map(meme => meme.id));
      const uniqueNewMemes = memes.filter(meme => !existingMemeIds.has(meme.id));

      // If no new unique memes, return the previous state unchanged
      if (uniqueNewMemes.length === 0) {
        return prev;
      }
      
      const newState = { 
        ...prev, 
        memes: [...prev.memes, ...uniqueNewMemes],
        isInitialized: true 
      };
      
      return newState;
    });
  }, []);

  const setHasMore = useCallback((hasMore: boolean) => {
    setState(prev => ({ ...prev, hasMore }));
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setQueryKey = useCallback((queryKey: string) => {
    setState(prev => ({ ...prev, queryKey }));
  }, []);

  const setScrollPosition = useCallback((position: number) => {
    setState(prev => ({ ...prev, scrollPosition: position }));
  }, []);

  const setFilters = useCallback((filters: Partial<MemesState['filters']>) => {
    setState(prev => {
      const newFilters = { ...prev.filters, ...filters };
      // Only reset if filters actually changed
      if (JSON.stringify(prev.filters) !== JSON.stringify(newFilters)) {
        return { 
          ...prev, 
          filters: newFilters,
          // Reset memes when filters change (keep isInitialized so filter UI does not unmount)
          memes: [],
          currentPage: 1,
          queryKey: '',
          scrollPosition: 0,
          hasMore: true,
        };
      }
      return prev;
    });
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('memesState');
      lastSavedState.current = '';
    }
  }, []);

  const isSameFilters = useCallback((filters: Partial<MemesState['filters']>) => {
    return Object.entries(filters).every(([key, value]) => 
      state.filters[key as keyof MemesState['filters']] === value
    );
  }, [state.filters]);

  const updateMemeLikeCount = useCallback((memeSlug: string, newLikeCount: number) => {
    // Ensure like count is never negative
    const safeLikeCount = Math.max(0, newLikeCount);
    
    if (newLikeCount !== safeLikeCount) {
      console.warn('Preventing negative like count:', {
        memeSlug,
        requested: newLikeCount,
        clamped: safeLikeCount
      });
    }
    
    setState(prev => {
      const updatedMemes = prev.memes.map(meme =>
        meme.slug === memeSlug ? { ...meme, likes_count: safeLikeCount } : meme
      );
      return {
        ...prev,
        memes: updatedMemes
      };
    });
  }, []);

  const updateMemeShareCount = useCallback((memeSlug: string, newShareCount: number) => {
    // Ensure share count is never negative
    const safeShareCount = Math.max(0, newShareCount);
    
    if (newShareCount !== safeShareCount) {
      console.warn('Preventing negative share count:', {
        memeSlug,
        requested: newShareCount,
        clamped: safeShareCount
      });
    }
    
    setState(prev => {
      const updatedMemes = prev.memes.map(meme =>
        meme.slug === memeSlug ? { ...meme, shares_count: safeShareCount } : meme
      );
      return {
        ...prev,
        memes: updatedMemes
      };
    });
  }, []);

  const updateMemeLikedState = useCallback((memeSlug: string, isLiked: boolean) => {
    setState(prev => {
      const updatedMemes = prev.memes.map(meme =>
        meme.slug === memeSlug ? { ...meme, is_liked: isLiked } : meme
      );
      return {
        ...prev,
        memes: updatedMemes
      };
    });
  }, []);

  const listValue = useMemo<MemesListStateContextType>(
    () => ({
      memes: state.memes,
      hasMore: state.hasMore,
      currentPage: state.currentPage,
      queryKey: state.queryKey,
      setMemes,
      appendMemes,
      setHasMore,
      setCurrentPage,
      setQueryKey,
      updateMemeLikeCount,
      updateMemeShareCount,
      updateMemeLikedState
    }),
    [
      state.memes,
      state.hasMore,
      state.currentPage,
      state.queryKey,
      setMemes,
      appendMemes,
      setHasMore,
      setCurrentPage,
      setQueryKey,
      updateMemeLikeCount,
      updateMemeShareCount,
      updateMemeLikedState
    ]
  );

  const uiValue = useMemo<MemesUIStateContextType>(
    () => ({
      filters: state.filters,
      scrollPosition: state.scrollPosition,
      isInitialized: state.isInitialized,
      setScrollPosition,
      setFilters,
      resetState,
      isSameFilters
    }),
    [
      state.filters,
      state.scrollPosition,
      state.isInitialized,
      setScrollPosition,
      setFilters,
      resetState,
      isSameFilters
    ]
  );

  const combinedValue = useMemo<MemesStateContextType>(
    () => ({
      state,
      ...listValue,
      ...uiValue
    }),
    [state, listValue, uiValue]
  );

  return (
    <MemesListStateContext.Provider value={listValue}>
      <MemesUIStateContext.Provider value={uiValue}>
        <MemesStateContext.Provider value={combinedValue}>
          {children}
        </MemesStateContext.Provider>
      </MemesUIStateContext.Provider>
    </MemesListStateContext.Provider>
  );
};
