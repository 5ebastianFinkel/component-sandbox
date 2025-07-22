import { SearchResult } from './searchIndexBuilder';
import { GroupedResults } from './searchUtils';

interface CacheEntry {
  results: GroupedResults;
  timestamp: number;
}

export class SearchCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds

  constructor(maxSize: number = 100, ttl: number = 5 * 60 * 1000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(query: string): GroupedResults | null {
    const entry = this.cache.get(query);
    
    if (!entry) return null;

    // Check if entry is still valid
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(query);
      return null;
    }

    return entry.results;
  }

  set(query: string, results: GroupedResults): void {
    // Clean up expired entries if cache is getting full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    // If still at max size after cleanup, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(query, {
      results,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  getSize(): number {
    return this.cache.size;
  }

  getStats(): { size: number; maxSize: number; hitRate: number } {
    // This is a simplified version - in a real implementation,
    // you'd track hits and misses
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0 // Would need to implement hit/miss tracking
    };
  }
}

// Global cache instance
export const searchCache = new SearchCache();