import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchEngine } from './searchUtils';
import { SearchResult } from './searchIndexBuilder';

// Mock FlexSearch
vi.mock('flexsearch', () => ({
  default: {
    Index: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      search: vi.fn().mockReturnValue([0, 1, 2]),
      clear: vi.fn()
    }))
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SearchEngine', () => {
  let searchEngine: SearchEngine;
  let mockData: SearchResult[];

  beforeEach(() => {
    vi.clearAllMocks();
    searchEngine = new SearchEngine();
    
    mockData = [
      {
        id: '1',
        title: 'Button Component',
        type: 'story',
        path: '/button',
        tags: ['ui', 'component'],
        componentName: 'Button',
        description: 'A reusable button component'
      },
      {
        id: '2',
        title: 'Form Documentation',
        type: 'docs',
        path: '/docs/form',
        headings: ['Getting Started', 'API Reference'],
        tags: ['form', 'input'],
        description: 'Complete form documentation'
      },
      {
        id: '3',
        title: 'Card Component',
        type: 'story',
        path: '/card',
        tags: ['ui', 'layout'],
        componentName: 'Card',
        description: 'A flexible card component'
      }
    ];
  });

  describe('buildIndex', () => {
    it('builds index with provided data', () => {
      searchEngine.buildIndex(mockData);
      
      // Index should be built and initialized
      expect(searchEngine['isInitialized']).toBe(true);
      expect(searchEngine['searchData']).toEqual(mockData);
    });

    it('clears existing indices before building', () => {
      const clearSpy = vi.spyOn(searchEngine['titleIndex'], 'clear');
      
      searchEngine.buildIndex(mockData);
      
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    beforeEach(() => {
      searchEngine.buildIndex(mockData);
    });

    it('returns empty array for empty query', () => {
      const results = searchEngine.search('');
      expect(results).toEqual([]);
    });

    it('returns empty array when not initialized', () => {
      const uninitializedEngine = new SearchEngine();
      const results = uninitializedEngine.search('button');
      expect(results).toEqual([]);
    });

    it('returns search results', () => {
      const results = searchEngine.search('button');
      expect(results).toHaveLength(3); // Based on mocked return [0, 1, 2]
      expect(results[0]).toEqual(mockData[0]);
    });

    it('respects maxResults option', () => {
      const results = searchEngine.search('button', { maxResults: 1 });
      expect(results).toHaveLength(1);
    });

    it('filters by includeStories option', () => {
      const results = searchEngine.search('button', { includeStories: true, includeDocs: false });
      // Would need more sophisticated mocking to test filtering
      expect(results).toBeDefined();
    });
  });

  describe('calculateScore', () => {
    beforeEach(() => {
      searchEngine.buildIndex(mockData);
    });

    it('gives higher score for title matches', () => {
      const result = mockData[0];
      const score = searchEngine['calculateScore'](result, 'button', {
        title: 3,
        componentName: 2.5,
        tags: 2,
        description: 1.5,
        headings: 1
      }, true);

      expect(score).toBeGreaterThan(0);
    });

    it('gives higher score for exact matches', () => {
      const result = mockData[0];
      const exactScore = searchEngine['calculateScore'](result, 'Button Component', {
        title: 3,
        componentName: 2.5,
        tags: 2,
        description: 1.5,
        headings: 1
      }, true);

      const partialScore = searchEngine['calculateScore'](result, 'Button', {
        title: 3,
        componentName: 2.5,
        tags: 2,
        description: 1.5,
        headings: 1
      }, true);

      expect(exactScore).toBeGreaterThan(partialScore);
    });
  });

  describe('groupResults', () => {
    it('groups results by type', () => {
      const grouped = searchEngine.groupResults(mockData);
      
      expect(grouped.stories).toHaveLength(2);
      expect(grouped.docs).toHaveLength(1);
      expect(grouped.total).toBe(3);
    });

    it('handles empty results', () => {
      const grouped = searchEngine.groupResults([]);
      
      expect(grouped.stories).toHaveLength(0);
      expect(grouped.docs).toHaveLength(0);
      expect(grouped.total).toBe(0);
    });
  });

  describe('getSuggestions', () => {
    beforeEach(() => {
      searchEngine.buildIndex(mockData);
    });

    it('returns empty array for short queries', () => {
      const suggestions = searchEngine.getSuggestions('a');
      expect(suggestions).toEqual([]);
    });

    it('returns suggestions for component names', () => {
      const suggestions = searchEngine.getSuggestions('bu');
      // Would need more sophisticated mocking to test actual suggestions
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
    });
  });

  describe('clear', () => {
    it('clears all data and indices', () => {
      searchEngine.buildIndex(mockData);
      searchEngine.clear();
      
      expect(searchEngine['searchData']).toHaveLength(0);
      expect(searchEngine['isInitialized']).toBe(false);
    });
  });
});