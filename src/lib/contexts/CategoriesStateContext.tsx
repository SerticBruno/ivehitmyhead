'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Category } from '@/lib/types/meme';

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface CategoriesStateContextType {
  state: CategoriesState;
  setCategories: (categories: Category[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  refetch: () => void;
}

const initialState: CategoriesState = {
  categories: [],
  loading: true,
  error: null,
  isInitialized: false
};

const CategoriesStateContext = createContext<CategoriesStateContextType | undefined>(undefined);

export const useCategoriesState = () => {
  const context = useContext(CategoriesStateContext);
  if (!context) {
    throw new Error('useCategoriesState must be used within a CategoriesStateProvider');
  }
  return context;
};

interface CategoriesStateProviderProps {
  children: React.ReactNode;
}

export const CategoriesStateProvider: React.FC<CategoriesStateProviderProps> = ({ children }) => {
  const [state, setState] = useState<CategoriesState>(initialState);
  const isInitialMount = useRef(true);
  const lastSavedState = useRef<string>('');

  // Load state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('categoriesState');
      
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          
          setState(parsedState);
          lastSavedState.current = savedState;
        } catch (error) {
          console.error('Failed to parse saved categories state:', error);
        }
      } else {
        console.log('No saved categories state found, using initial state');
      }
    }
  }, []);

  // Save state to sessionStorage whenever it changes - with debouncing
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialMount.current) {
      const currentState = JSON.stringify(state);
      if (currentState !== lastSavedState.current) {
        lastSavedState.current = currentState;
        sessionStorage.setItem('categoriesState', currentState);
      }
    }
    isInitialMount.current = false;
  }, [state]);

  const setCategories = useCallback((categories: Category[]) => {
    setState(prev => ({ 
      ...prev, 
      categories, 
      loading: false, 
      error: null, 
      isInitialized: true 
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ 
      ...prev, 
      error, 
      loading: false,
      isInitialized: true 
    }));
  }, []);

  const refetch = useCallback(() => {
    setState(prev => ({ ...prev, loading: true, error: null }));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo<CategoriesStateContextType>(() => ({
    state,
    setCategories,
    setLoading,
    setError,
    refetch
  }), [state, setCategories, setLoading, setError, refetch]);

  return (
    <CategoriesStateContext.Provider value={value}>
      {children}
    </CategoriesStateContext.Provider>
  );
};
