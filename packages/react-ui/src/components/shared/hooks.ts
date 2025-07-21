/**
 * @fileoverview Custom React hooks for design token components
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Token, ClipboardResult } from './types';
import { 
  copyToClipboard, 
  formatTokenForDisplay, 
  filterTokens,
  announceToScreenReader 
} from './utils';
import { ANIMATION_DURATIONS } from './constants';

/**
 * Hook for copying tokens to clipboard with feedback
 * @returns {Object} Clipboard utilities
 * @example
 * const { copiedToken, copyToken } = useCopyToClipboard();
 * 
 * const handleCopy = () => {
 *   copyToken('--color-brand-default');
 * };
 * 
 * if (copiedToken === '--color-brand-default') {
 *   // Show copied feedback
 * }
 */
export function useCopyToClipboard() {
  const [copiedToken, setCopiedToken] = useState<string>('');
  const [error, setError] = useState<string>('');

  /**
   * Copies a token to clipboard with visual feedback
   * @param {string} tokenName - Token name to copy
   * @param {boolean} [includeVar=true] - Whether to wrap in var()
   */
  const copyToken = useCallback(async (
    tokenName: string, 
    includeVar: boolean = true
  ): Promise<void> => {
    const textToCopy = formatTokenForDisplay(tokenName, includeVar);
    
    const result: ClipboardResult = await copyToClipboard(textToCopy);
    
    if (result.success) {
      setCopiedToken(tokenName);
      setError('');
      
      // Announce to screen readers
      announceToScreenReader(`Token ${tokenName} kopiert`);
      
      // Reset copied state after animation
      setTimeout(() => {
        setCopiedToken('');
      }, ANIMATION_DURATIONS.COPY_FEEDBACK);
    } else {
      setError(result.error || 'Kopieren fehlgeschlagen');
      
      // Clear error after a delay
      setTimeout(() => {
        setError('');
      }, ANIMATION_DURATIONS.COPY_FEEDBACK);
    }
  }, []);

  /**
   * Resets the copied state
   */
  const resetCopied = useCallback(() => {
    setCopiedToken('');
    setError('');
  }, []);

  return {
    copiedToken,
    error,
    copyToken,
    resetCopied,
    isCopied: (tokenName: string) => copiedToken === tokenName
  };
}

/**
 * Hook for filtering tokens with debounced search
 * @param {Token[]} tokens - Array of tokens to filter
 * @param {Object} [options] - Filter options
 * @param {number} [options.debounceDelay=300] - Search debounce delay
 * @returns {Object} Filter utilities and filtered results
 * @example
 * const {
 *   filteredTokens,
 *   searchTerm,
 *   setSearchTerm,
 *   selectedCategory,
 *   setSelectedCategory
 * } = useTokenFilter(allTokens);
 */
export function useTokenFilter(
  tokens: Token[],
  options: {
    debounceDelay?: number;
  } = {}
) {
  const { debounceDelay = 300 } = options;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customFilter, setCustomFilter] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceDelay]);

  // Filter tokens
  const filteredTokens = useMemo(() => {
    return filterTokens(tokens, {
      searchTerm: debouncedSearchTerm,
      category: selectedCategory,
      customFilter
    });
  }, [tokens, debouncedSearchTerm, selectedCategory, customFilter]);

  /**
   * Resets all filters
   */
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setSelectedCategory('');
    setCustomFilter('');
  }, []);

  /**
   * Gets unique categories from tokens
   */
  const categories = useMemo(() => {
    const uniqueCategories = new Set(tokens.map(token => token.category));
    return Array.from(uniqueCategories).sort();
  }, [tokens]);

  return {
    // State
    filteredTokens,
    searchTerm,
    selectedCategory,
    customFilter,
    categories,
    
    // Actions
    setSearchTerm,
    setSelectedCategory,
    setCustomFilter,
    resetFilters,
    
    // Utils
    hasActiveFilters: Boolean(searchTerm || selectedCategory || customFilter),
    resultCount: filteredTokens.length,
    totalCount: tokens.length
  };
}

/**
 * Hook for managing focus within a token grid
 * @param {number} itemCount - Number of items in the grid
 * @param {number} [columns=4] - Number of columns in grid
 * @returns {Object} Focus management utilities
 * @example
 * const { focusedIndex, handleKeyDown } = useTokenGridFocus(tokens.length);
 */
export function useTokenGridFocus(itemCount: number, columns: number = 4) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  /**
   * Handles keyboard navigation within grid
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (focusedIndex === -1) return;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev < itemCount - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowLeft':
        event.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : prev
        );
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = prev + columns;
          return nextIndex < itemCount ? nextIndex : prev;
        });
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => {
          const prevIndex = prev - columns;
          return prevIndex >= 0 ? prevIndex : prev;
        });
        break;
        
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
        
      case 'End':
        event.preventDefault();
        setFocusedIndex(itemCount - 1);
        break;
    }
  }, [focusedIndex, itemCount, columns]);

  /**
   * Sets focus to specific index
   */
  const setFocus = useCallback((index: number) => {
    if (index >= 0 && index < itemCount) {
      setFocusedIndex(index);
    }
  }, [itemCount]);

  /**
   * Resets focus
   */
  const resetFocus = useCallback(() => {
    setFocusedIndex(-1);
  }, []);

  return {
    focusedIndex,
    handleKeyDown,
    setFocus,
    resetFocus,
    isFocused: (index: number) => focusedIndex === index
  };
}

/**
 * Hook for managing token component visibility
 * @param {boolean} [initialVisible=true] - Initial visibility state
 * @returns {Object} Visibility state and controls
 * @example
 * const { isVisible, toggle, show, hide } = useTokenVisibility();
 */
export function useTokenVisibility(initialVisible: boolean = true) {
  const [isVisible, setIsVisible] = useState(initialVisible);

  const toggle = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  return {
    isVisible,
    toggle,
    show,
    hide
  };
}

/**
 * Hook for managing local storage preferences
 * @param {string} key - Storage key
 * @param {T} defaultValue - Default value
 * @returns {[T, (value: T) => void]} State and setter
 * @example
 * const [showValues, setShowValues] = useLocalStorage('token-show-values', true);
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  // Get initial value from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Update localStorage when value changes
  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}