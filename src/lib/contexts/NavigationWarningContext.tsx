'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface NavigationWarningContextType {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  markNavigationAsIntentional: () => void;
}

const NavigationWarningContext = createContext<NavigationWarningContextType | undefined>(undefined);

interface NavigationWarningProviderProps {
  children: ReactNode;
}

export const NavigationWarningProvider: React.FC<NavigationWarningProviderProps> = ({ children }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [message, setMessage] = useState('You have unsaved changes. Are you sure you want to leave?');
  const [isNavigating, setIsNavigating] = useState(false);

  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  const setMessageText = useCallback((newMessage: string) => {
    setMessage(newMessage);
  }, []);

  const markNavigationAsIntentional = useCallback(() => {
    setIsNavigating(true);
  }, []);

  // Handle beforeunload (page refresh/close)
  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty && !isNavigating) {
        event.preventDefault();
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isNavigating, message]);

  // Handle browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isDirty && !isNavigating) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.href);
          event.preventDefault();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty, isNavigating, message]);

  // Handle link clicks
  React.useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      if (!isDirty || isNavigating) return;

      const target = event.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
        const currentOrigin = window.location.origin;
        const linkOrigin = new URL(link.href).origin;
        
        // Only intercept internal navigation
        if (linkOrigin === currentOrigin) {
          const confirmed = window.confirm(message);
          if (!confirmed) {
            event.preventDefault();
            event.stopPropagation();
            return false;
          }
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleLinkClick, true);
    return () => document.removeEventListener('click', handleLinkClick, true);
  }, [isDirty, isNavigating, message]);

  // Reset navigation flag when isDirty changes
  React.useEffect(() => {
    setIsNavigating(false);
  }, [isDirty]);

  const value: NavigationWarningContextType = {
    isDirty,
    setDirty,
    message,
    setMessage: setMessageText,
    markNavigationAsIntentional,
  };

  return (
    <NavigationWarningContext.Provider value={value}>
      {children}
    </NavigationWarningContext.Provider>
  );
};

export const useNavigationWarning = (): NavigationWarningContextType => {
  const context = useContext(NavigationWarningContext);
  if (context === undefined) {
    throw new Error('useNavigationWarning must be used within a NavigationWarningProvider');
  }
  return context;
};
