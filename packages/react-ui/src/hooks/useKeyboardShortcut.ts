import { useEffect, useCallback } from 'react';

interface KeyboardShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  deps: React.DependencyList = [],
  options: KeyboardShortcutOptions = { preventDefault: true, stopPropagation: true }
) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Detect OS for correct modifier key
    const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const isModifierPressed = isMac ? event.metaKey : event.ctrlKey;
    
    // Check if the correct key combination is pressed
    if (isModifierPressed && event.key.toLowerCase() === key.toLowerCase()) {
      if (options.preventDefault) {
        event.preventDefault();
      }
      if (options.stopPropagation) {
        event.stopPropagation();
      }
      
      // Only trigger if not typing in an input field (unless specifically overridden)
      const activeElement = document.activeElement;
      const isInputField = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.hasAttribute('contenteditable')
      );
      
      // For CMD/CTRL+K, we want to override input behavior
      if (key.toLowerCase() === 'k' && isModifierPressed) {
        callback();
        return;
      }
      
      // For other shortcuts, respect input field focus
      if (!isInputField) {
        callback();
      }
    }
  }, [key, callback, options.preventDefault, options.stopPropagation, ...deps]);

  useEffect(() => {
    // Add listener to document for global shortcuts
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [handleKeyDown]);
};