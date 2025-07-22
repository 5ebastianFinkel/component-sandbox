import { useCallback, useRef } from 'react';

/**
 * Hook for optimizing expensive operations with memoization and debouncing
 */
export const usePerformanceOptimization = () => {
  const memoCache = useRef(new Map<string, any>());
  
  // Memoization with custom key
  const memoize = useCallback(<T, Args extends any[]>(
    fn: (...args: Args) => T,
    keyFn: (...args: Args) => string,
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ) => {
    return (...args: Args): T => {
      const key = keyFn(...args);
      const cached = memoCache.current.get(key);
      
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      
      const result = fn(...args);
      memoCache.current.set(key, {
        value: result,
        timestamp: Date.now()
      });
      
      return result;
    };
  }, []);

  // Debounce with immediate execution option
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    immediate = false
  ): T => {
    let timeoutId: NodeJS.Timeout | null = null;
    let lastCallTime = 0;
    
    return ((...args: any[]) => {
      const now = Date.now();
      const shouldCallImmediately = immediate && (now - lastCallTime > delay);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (shouldCallImmediately) {
        lastCallTime = now;
        return func.apply(null, args);
      }
      
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        func.apply(null, args);
      }, delay);
    }) as T;
  }, []);

  // Throttle function
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): T => {
    let inThrottle = false;
    
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(null, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    }) as T;
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    memoCache.current.clear();
  }, []);

  // Get cache stats
  const getCacheStats = useCallback(() => {
    return {
      size: memoCache.current.size,
      entries: Array.from(memoCache.current.entries()).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp
      }))
    };
  }, []);

  return {
    memoize,
    debounce,
    throttle,
    clearCache,
    getCacheStats
  };
};