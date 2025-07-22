import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchHistory } from './searchHistory';
import { SearchResult } from './searchIndexBuilder';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SearchHistory', () => {
  let searchHistory: SearchHistory;
  let mockResult: SearchResult;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    searchHistory = new SearchHistory(10); // Small max size for testing
    
    mockResult = {
      id: '1',
      title: 'Button Component',
      type: 'story',
      path: '/button',
      tags: ['ui', 'component'],
      componentName: 'Button'
    };
  });

  describe('addQuery', () => {
    it('adds query to history', () => {
      searchHistory.addQuery('button', 5);
      
      const recent = searchHistory.getRecentSearches(1);
      expect(recent).toHaveLength(1);
      expect(recent[0].query).toBe('button');
      expect(recent[0].resultCount).toBe(5);
    });

    it('ignores empty queries', () => {
      searchHistory.addQuery('  ', 0);
      
      const recent = searchHistory.getRecentSearches();
      expect(recent).toHaveLength(0);
    });

    it('trims whitespace from queries', () => {
      searchHistory.addQuery('  button  ', 5);
      
      const recent = searchHistory.getRecentSearches(1);
      expect(recent[0].query).toBe('button');
    });

    it('removes duplicate queries and moves to front', () => {
      searchHistory.addQuery('button', 5);
      searchHistory.addQuery('card', 3);
      searchHistory.addQuery('button', 7);
      
      const recent = searchHistory.getRecentSearches();
      expect(recent).toHaveLength(2);
      expect(recent[0].query).toBe('button');
      expect(recent[0].resultCount).toBe(7);
    });

    it('respects max size limit', () => {
      for (let i = 0; i < 15; i++) {
        searchHistory.addQuery(`query-${i}`, 1);
      }
      
      const recent = searchHistory.getRecentSearches();
      expect(recent).toHaveLength(10); // maxSize
    });
  });

  describe('addSelection', () => {
    it('adds selection to existing query', () => {
      searchHistory.addQuery('button', 5);
      searchHistory.addSelection('button', mockResult);
      
      const recent = searchHistory.getRecentSearches(1);
      expect(recent[0].result).toEqual(mockResult);
    });

    it('creates new entry for unknown query', () => {
      searchHistory.addSelection('button', mockResult);
      
      const recent = searchHistory.getRecentSearches(1);
      expect(recent[0].query).toBe('button');
      expect(recent[0].result).toEqual(mockResult);
    });

    it('moves existing entry to front when updated', () => {
      searchHistory.addQuery('button', 5);
      searchHistory.addQuery('card', 3);
      searchHistory.addSelection('button', mockResult);
      
      const recent = searchHistory.getRecentSearches();
      expect(recent[0].query).toBe('button');
      expect(recent[0].result).toEqual(mockResult);
    });
  });

  describe('getSuggestions', () => {
    beforeEach(() => {
      searchHistory.addQuery('button', 5);
      searchHistory.addQuery('badge', 3);
      searchHistory.addQuery('card', 7);
    });

    it('returns matching suggestions', () => {
      const suggestions = searchHistory.getSuggestions('b');
      expect(suggestions).toContain('button');
      expect(suggestions).toContain('badge');
      expect(suggestions).not.toContain('card');
    });

    it('returns empty array for empty input', () => {
      const suggestions = searchHistory.getSuggestions('');
      expect(suggestions).toEqual([]);
    });

    it('respects limit parameter', () => {
      searchHistory.addQuery('banana', 1);
      searchHistory.addQuery('ball', 1);
      
      const suggestions = searchHistory.getSuggestions('b', 2);
      expect(suggestions).toHaveLength(2);
    });
  });

  describe('getPopularSearches', () => {
    it('returns popular searches by frequency', () => {
      searchHistory.addQuery('button', 5);
      searchHistory.addQuery('card', 3);
      searchHistory.addQuery('button', 5); // Increases frequency
      searchHistory.addQuery('form', 2);
      
      const popular = searchHistory.getPopularSearches(2);
      expect(popular[0].query).toBe('button'); // Most frequent
    });

    it('uses most recent timestamp for duplicate queries', () => {
      const firstTime = Date.now() - 1000;
      const secondTime = Date.now();
      
      vi.spyOn(Date, 'now')
        .mockReturnValueOnce(firstTime)
        .mockReturnValueOnce(secondTime);
      
      searchHistory.addQuery('button', 5);
      searchHistory.addQuery('button', 5);
      
      const popular = searchHistory.getPopularSearches(1);
      expect(popular[0].timestamp).toBe(secondTime);
    });
  });

  describe('persistence', () => {
    it('saves to localStorage when adding queries', () => {
      searchHistory.addQuery('button', 5);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'storybook-search-history',
        expect.any(String)
      );
    });

    it('loads from localStorage on initialization', () => {
      const historyData = [
        { query: 'button', timestamp: Date.now(), resultCount: 5 }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(historyData));
      
      const newHistory = new SearchHistory();
      const recent = newHistory.getRecentSearches();
      
      expect(recent).toHaveLength(1);
      expect(recent[0].query).toBe('button');
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      expect(() => new SearchHistory()).not.toThrow();
    });
  });

  describe('remove', () => {
    it('removes specific entry', () => {
      searchHistory.addQuery('button', 5);
      searchHistory.addQuery('card', 3);
      
      searchHistory.remove('button');
      
      const recent = searchHistory.getRecentSearches();
      expect(recent).toHaveLength(1);
      expect(recent[0].query).toBe('card');
    });
  });

  describe('clear', () => {
    it('clears all history', () => {
      searchHistory.addQuery('button', 5);
      searchHistory.addQuery('card', 3);
      
      searchHistory.clear();
      
      const recent = searchHistory.getRecentSearches();
      expect(recent).toHaveLength(0);
    });
  });

  describe('getSize', () => {
    it('returns correct size', () => {
      expect(searchHistory.getSize()).toBe(0);
      
      searchHistory.addQuery('button', 5);
      expect(searchHistory.getSize()).toBe(1);
      
      searchHistory.addQuery('card', 3);
      expect(searchHistory.getSize()).toBe(2);
    });
  });
});