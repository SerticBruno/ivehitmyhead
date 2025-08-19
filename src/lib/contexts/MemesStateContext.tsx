'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  const lastSavedState = useRef<string>('');

  // Load state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('memesState');
      console.log('Loading state from sessionStorage:', savedState ? 'Found saved state' : 'No saved state');
      
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          console.log('Restored context state:', {
            memesCount: parsedState.memes?.length || 0,
            hasMore: parsedState.hasMore,
            currentPage: parsedState.currentPage,
            isInitialized: parsedState.isInitialized,
            filters: parsedState.filters
          });
          
          setState(parsedState);
          lastSavedState.current = savedState;
        } catch (error) {
          console.error('Failed to parse saved memes state:', error);
        }
      } else {
        console.log('No saved state found, using initial state');
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
      console.log('setMemes called:', {
        memeCount: memes.length,
        currentFilters: prev.filters,
        isInitialized: prev.isInitialized
      });
      
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
      console.log('appendMemes called:', {
        newMemeCount: memes.length,
        existingMemeCount: prev.memes.length,
        currentFilters: prev.filters,
        isInitialized: prev.isInitialized,
        currentHasMore: prev.hasMore,
        currentPage: prev.currentPage
      });
      
      // Always deduplicate when appending to prevent duplicates
      const existingMemeIds = new Set(prev.memes.map(meme => meme.id));
      const uniqueNewMemes = memes.filter(meme => !existingMemeIds.has(meme.id));
      
      console.log('Deduplication result:', {
        originalCount: memes.length,
        uniqueCount: uniqueNewMemes.length,
        filteredOut: memes.length - uniqueNewMemes.length,
        existingIds: Array.from(existingMemeIds).slice(0, 5) // Show first 5 IDs for debugging
      });
      
      // If no new unique memes, return the previous state unchanged
      if (uniqueNewMemes.length === 0) {
        console.warn('No new unique memes to append - all were duplicates');
        return prev;
      }
      
      const newState = { 
        ...prev, 
        memes: [...prev.memes, ...uniqueNewMemes],
        isInitialized: true 
      };
      
      console.log('New state after append:', {
        totalMemes: newState.memes.length,
        hasMore: newState.hasMore,
        currentPage: newState.currentPage,
        newMemeIds: uniqueNewMemes.map(m => m.id).slice(0, 5) // Show first 5 new IDs
      });
      
      return newState;
    });
  }, []);

  const setHasMore = useCallback((hasMore: boolean) => {
    setState(prev => ({ ...prev, hasMore }));
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setScrollPosition = useCallback((position: number) => {
    setState(prev => ({ ...prev, scrollPosition: position }));
  }, []);

  const setFilters = useCallback((filters: Partial<MemesState['filters']>) => {
    setState(prev => {
      const newFilters = { ...prev.filters, ...filters };
      // Only reset if filters actually changed
      if (JSON.stringify(prev.filters) !== JSON.stringify(newFilters)) {
        console.log('Filters changed, clearing memes:', {
          oldFilters: prev.filters,
          newFilters: newFilters,
          currentMemeCount: prev.memes.length
        });
        
        return { 
          ...prev, 
          filters: newFilters,
          // Reset memes when filters change
          memes: [],
          currentPage: 1,
          hasMore: true,
          isInitialized: false
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
    const result = Object.entries(filters).every(([key, value]) => 
      state.filters[key as keyof MemesState['filters']] === value
    );
    
    console.log('isSameFilters check:', {
      incomingFilters: filters,
      currentContextFilters: state.filters,
      result
    });
    
    return result;
  }, [state.filters]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<MemesStateContextType>(() => ({
    state,
    setMemes,
    appendMemes,
    setHasMore,
    setCurrentPage,
    setScrollPosition,
    setFilters,
    resetState,
    isSameFilters
  }), [state, setMemes, appendMemes, setHasMore, setCurrentPage, setScrollPosition, setFilters, resetState, isSameFilters]);

  return (
    <MemesStateContext.Provider value={value}>
      {children}
    </MemesStateContext.Provider>
  );
};
