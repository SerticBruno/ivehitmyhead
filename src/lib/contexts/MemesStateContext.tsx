'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Meme } from '@/lib/types/meme';

interface MemesState {
  memes: Meme[];
  hasMore: boolean;
  currentPage: number;
  scrollPosition: number;
  filters: {
    category_id: string;
    filter: 'newest' | 'trending' | 'hottest';
    time_period: 'all' | 'today' | 'week' | 'month';
  };
  isInitialized: boolean;
}

interface MemesStateContextType {
  state: MemesState;
  setMemes: (memes: Meme[]) => void;
  appendMemes: (memes: Meme[]) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setScrollPosition: (position: number) => void;
  setFilters: (filters: Partial<MemesState['filters']>) => void;
  resetState: () => void;
  isSameFilters: (filters: Partial<MemesState['filters']>) => boolean;
}

const initialState: MemesState = {
  memes: [],
  hasMore: true,
  currentPage: 1,
  scrollPosition: 0,
  filters: {
    category_id: '',
    filter: 'newest',
    time_period: 'all'
  },
  isInitialized: false
};

const MemesStateContext = createContext<MemesStateContextType | undefined>(undefined);

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

  // Load state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('memesState');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          setState(parsedState);
        } catch (error) {
          console.error('Failed to parse saved memes state:', error);
        }
      }
    }
  }, []);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialMount.current) {
      sessionStorage.setItem('memesState', JSON.stringify(state));
    }
    isInitialMount.current = false;
  }, [state]);

  // Save scroll position before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('memesState', JSON.stringify({
          ...state,
          scrollPosition: window.scrollY
        }));
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

  const setMemes = (memes: Meme[]) => {
    setState(prev => ({ ...prev, memes, isInitialized: true }));
  };

  const appendMemes = (memes: Meme[]) => {
    setState(prev => ({ 
      ...prev, 
      memes: [...prev.memes, ...memes],
      isInitialized: true 
    }));
  };

  const setHasMore = (hasMore: boolean) => {
    setState(prev => ({ ...prev, hasMore }));
  };

  const setCurrentPage = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const setScrollPosition = (position: number) => {
    setState(prev => ({ ...prev, scrollPosition: position }));
  };

  const setFilters = (filters: Partial<MemesState['filters']>) => {
    setState(prev => ({ 
      ...prev, 
      filters: { ...prev.filters, ...filters },
      // Reset memes when filters change
      memes: [],
      currentPage: 1,
      hasMore: true,
      isInitialized: false
    }));
  };

  const resetState = () => {
    setState(initialState);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('memesState');
    }
  };

  const isSameFilters = (filters: Partial<MemesState['filters']>) => {
    return Object.entries(filters).every(([key, value]) => 
      state.filters[key as keyof MemesState['filters']] === value
    );
  };

  const value: MemesStateContextType = {
    state,
    setMemes,
    appendMemes,
    setHasMore,
    setCurrentPage,
    setScrollPosition,
    setFilters,
    resetState,
    isSameFilters
  };

  return (
    <MemesStateContext.Provider value={value}>
      {children}
    </MemesStateContext.Provider>
  );
};
