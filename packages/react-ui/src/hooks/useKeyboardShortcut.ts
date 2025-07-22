import { useEffect, useCallback } from 'react';

export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  deps: React.DependencyList = []
) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isModifierPressed = isMac ? event.metaKey : event.ctrlKey;
    
    if (isModifierPressed && event.key.toLowerCase() === key.toLowerCase()) {
      event.preventDefault();
      callback();
    }
  }, [key, callback, ...deps]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};