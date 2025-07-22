import { SearchResult } from './searchIndexBuilder';

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  result?: SearchResult;
  resultCount?: number;
}

export class SearchHistory {
  private history: SearchHistoryItem[] = [];
  private readonly maxSize: number;
  private readonly storageKey = 'storybook-search-history';

  constructor(maxSize: number = 50) {
    this.maxSize = maxSize;
    this.loadFromStorage();
  }

  // Add a search query to history
  addQuery(query: string, resultCount?: number): void {
    if (!query.trim()) return;

    // Remove existing entry if it exists
    this.history = this.history.filter(item => item.query !== query);

    // Add new entry at the beginning
    this.history.unshift({
      query: query.trim(),
      timestamp: Date.now(),
      resultCount
    });

    // Keep only the most recent entries
    this.history = this.history.slice(0, this.maxSize);

    this.saveToStorage();
  }

  // Add a selected result to history
  addSelection(query: string, result: SearchResult): void {
    const existingIndex = this.history.findIndex(item => item.query === query);
    
    if (existingIndex >= 0) {
      // Update existing entry
      this.history[existingIndex] = {
        ...this.history[existingIndex],
        result,
        timestamp: Date.now()
      };
      
      // Move to front
      const [item] = this.history.splice(existingIndex, 1);
      this.history.unshift(item);
    } else {
      // Create new entry
      this.addQuery(query, 1);
      if (this.history.length > 0) {
        this.history[0].result = result;
      }
    }

    this.saveToStorage();
  }

  // Get recent searches
  getRecentSearches(limit: number = 10): SearchHistoryItem[] {
    return this.history.slice(0, limit);
  }

  // Get suggestions based on partial input
  getSuggestions(partial: string, limit: number = 5): string[] {
    if (!partial.trim()) return [];

    const lowerPartial = partial.toLowerCase();
    return this.history
      .filter(item => item.query.toLowerCase().startsWith(lowerPartial))
      .map(item => item.query)
      .slice(0, limit);
  }

  // Get popular searches
  getPopularSearches(limit: number = 5): SearchHistoryItem[] {
    // Group by query and count frequency
    const frequency = new Map<string, { count: number; item: SearchHistoryItem }>();
    
    this.history.forEach(item => {
      const existing = frequency.get(item.query);
      if (existing) {
        existing.count++;
        // Keep the most recent timestamp
        if (item.timestamp > existing.item.timestamp) {
          existing.item = item;
        }
      } else {
        frequency.set(item.query, { count: 1, item });
      }
    });

    return Array.from(frequency.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(entry => entry.item);
  }

  // Clear history
  clear(): void {
    this.history = [];
    this.saveToStorage();
  }

  // Remove specific entry
  remove(query: string): void {
    this.history = this.history.filter(item => item.query !== query);
    this.saveToStorage();
  }

  // Get history size
  getSize(): number {
    return this.history.length;
  }

  // Private methods for persistence
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.history = parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load search history from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      console.warn('Failed to save search history to storage:', error);
    }
  }
}

// Global search history instance
export const searchHistory = new SearchHistory();