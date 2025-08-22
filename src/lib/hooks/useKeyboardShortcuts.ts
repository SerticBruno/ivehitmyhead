import { useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  onRestoreScroll?: () => void;
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ onRestoreScroll, enabled = true }: UseKeyboardShortcutsOptions = {}) => {
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + R to restore scroll position
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        onRestoreScroll?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onRestoreScroll]);
};
