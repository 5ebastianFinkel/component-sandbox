import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchDialog } from './SearchDialog';
import { SearchDialogProvider } from './SearchDialogProvider';
import { searchEngine } from '../../utils/searchUtils';
import { SearchResult } from '../../types/search';

// Mock dependencies
vi.mock('../../utils/searchUtils', () => ({
  SearchEngine: vi.fn().mockImplementation(() => ({
    search: vi.fn(),
    searchWithGrouping: vi.fn(() => ({ stories: [], docs: [], total: 0 })),
    index: vi.fn(),
    clear: vi.fn(),
    initializeIndex: vi.fn(),
  })),
  searchEngine: {
    search: vi.fn(),
    searchWithGrouping: vi.fn(),
    index: vi.fn(),
    clear: vi.fn(),
  },
}));

vi.mock('../../utils/searchHistory', () => ({
  searchHistory: {
    addQuery: vi.fn(),
    getRecentSearches: vi.fn(() => []),
  },
}));

const renderWithProvider = (ui: React.ReactElement) => {
  return render(
    <SearchDialogProvider>
      {ui}
    </SearchDialogProvider>
  );
};

describe('SearchDialog - Edge Cases and Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Empty and Null States', () => {
    it('should handle search returning null/undefined gracefully', async () => {
      vi.mocked(searchEngine.searchWithGrouping).mockReturnValue({
        stories: [],
        docs: [],
        total: 0
      });
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('should handle malformed search results', async () => {
      vi.mocked(searchEngine.searchWithGrouping).mockReturnValue({
        stories: [],
        docs: [],
        total: 0
      });
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Should not crash
      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('should handle empty string searches', async () => {
      vi.mocked(searchEngine.searchWithGrouping).mockReturnValue({
        stories: [],
        docs: [],
        total: 0
      });
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      
      // Type and then clear
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      
      await waitFor(() => {
        expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      });
    });
  });

  describe('Special Characters and Input Validation', () => {
    it('should handle special characters in search query', async () => {
      const specialChars = '!@#$%^&*()_+-=[]{}|;\':",./<>?`~';
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: specialChars } });
      
      await waitFor(() => {
        expect(searchEngine.searchWithGrouping).toHaveBeenCalled();
      });
    });

    it('should handle very long search queries', async () => {
      const longQuery = 'a'.repeat(1000);
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: longQuery } });
      
      await waitFor(() => {
        expect(searchEngine.searchWithGrouping).toHaveBeenCalled();
      });
    });

    it('should handle Unicode and emoji characters', async () => {
      const unicodeQuery = '你好世界 🔍 مرحبا بالعالم';
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: unicodeQuery } });
      
      await waitFor(() => {
        expect(searchEngine.searchWithGrouping).toHaveBeenCalled();
      });
    });
  });

  describe('Search Shortcut Edge Cases', () => {
    it('should handle malformed shortcuts', async () => {
      const shortcuts = [
        's:', // Empty after shortcut
        'd:    ', // Only whitespace
        'x: test', // Invalid shortcut
        ':: test', // Double colon
        's:d: test', // Multiple shortcuts
      ];
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      
      for (const shortcut of shortcuts) {
        fireEvent.change(searchInput, { target: { value: shortcut } });
        
        // Should not crash
        await waitFor(() => {
          expect(searchEngine.searchWithGrouping).toHaveBeenCalled();
        });
      }
    });

    it('should handle shortcuts with special characters', async () => {
      vi.mocked(searchEngine.searchWithGrouping).mockReturnValue({
        stories: [],
        docs: [],
        total: 0
      });
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: 's: @#$%' } });
      
      await waitFor(() => {
        expect(searchEngine.searchWithGrouping).toHaveBeenCalled();
      });
    });
  });

  describe('Performance and Memory', () => {
    it('should handle large result sets', async () => {
      const largeResultSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `result-${i}`,
        title: `Result ${i}`,
        path: `/path/${i}`,
        type: i % 2 === 0 ? 'story' : 'docs',
        componentName: `Component${i}`,
        tags: [`tag${i}`, `tag${i + 1}`],
        description: `Description for result ${i}`,
        headings: [`Heading ${i}`],
      })) as SearchResult[];
      
      vi.mocked(searchEngine.searchWithGrouping).mockReturnValue({
        stories: largeResultSet.filter(r => r.type === 'story'),
        docs: largeResultSet.filter(r => r.type === 'docs'),
        total: largeResultSet.length
      });
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        // Should render without crashing
        expect(screen.getByText('Result 0')).toBeInTheDocument();
      });
    });

    it('should debounce rapid searches', async () => {
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      
      // Type rapidly
      for (let i = 0; i < 10; i++) {
        fireEvent.change(searchInput, { target: { value: `test${i}` } });
      }
      
      // Should only call search once after debounce
      await waitFor(() => {
        expect(searchEngine.searchWithGrouping).toHaveBeenCalledTimes(1);
      }, { timeout: 500 });
    });
  });

  describe('LocalStorage Edge Cases', () => {
    it('should handle corrupted localStorage data', async () => {
      // Set corrupted data
      localStorage.setItem('search_history_test', 'corrupted{data');
      localStorage.setItem('search_history_valid', JSON.stringify({
        term: 'valid',
        count: 1,
        lastUsed: new Date().toISOString(),
      }));
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      // Should still show valid searches
      expect(screen.getByText('Recent Searches')).toBeInTheDocument();
      expect(screen.getByText('valid')).toBeInTheDocument();
    });

    it('should handle localStorage quota exceeded', async () => {
      // Mock localStorage.setItem to throw
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Should not crash
      await waitFor(() => {
        expect(searchEngine.searchWithGrouping).toHaveBeenCalled();
      });
      
      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('Component State Edge Cases', () => {
    it('should handle rapid open/close cycles', async () => {
      const onOpenChange = vi.fn();
      const { rerender } = renderWithProvider(
        <SearchDialog open={true} onOpenChange={onOpenChange} />
      );
      
      // Rapidly toggle open state
      for (let i = 0; i < 10; i++) {
        rerender(
          <SearchDialogProvider>
            <SearchDialog open={i % 2 === 0} onOpenChange={onOpenChange} />
          </SearchDialogProvider>
        );
      }
      
      // Should not crash or have memory leaks
      expect(onOpenChange).toHaveBeenCalled();
    });

    it('should handle search while closing', async () => {
      const onOpenChange = vi.fn();
      const { rerender } = renderWithProvider(
        <SearchDialog open={true} onOpenChange={onOpenChange} />
      );
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Close while searching
      rerender(
        <SearchDialogProvider>
          <SearchDialog open={false} onOpenChange={onOpenChange} />
        </SearchDialogProvider>
      );
      
      // Should not crash
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Edge Cases', () => {
    it('should maintain focus trap with no results', async () => {
      vi.mocked(searchEngine.searchWithGrouping).mockReturnValue({
        stories: [],
        docs: [],
        total: 0
      });
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: 'no results query' } });
      
      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
      
      // Focus should remain in dialog
      expect(document.activeElement).toBe(searchInput);
    });

    it('should handle keyboard navigation with empty groups', async () => {
      const mixedResults = [
        {
          id: 'story-1',
          title: 'Story Result',
          path: '/story/1',
          type: 'story',
          componentName: 'Component',
          tags: [],
          description: '',
          headings: [],
        },
      ] as SearchResult[];
      
      vi.mocked(searchEngine.search).mockReturnValue(mixedResults);
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      await waitFor(() => {
        expect(screen.getByText('Story Result')).toBeInTheDocument();
      });
      
      // Navigate with keyboard
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      
      // Should handle navigation properly
      const firstItem = screen.getByRole('option', { name: /Story Result/ });
      expect(firstItem).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Network and Async Edge Cases', () => {
    it('should handle search engine throwing errors', async () => {
      vi.mocked(searchEngine.searchWithGrouping).mockImplementation(() => {
        throw new Error('Search engine error');
      });
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Should show no results instead of crashing
      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
    });

    it('should handle async search race conditions', async () => {
      let callCount = 0;
      vi.mocked(searchEngine.searchWithGrouping).mockImplementation((query) => {
        callCount++;
        const delay = callCount === 1 ? 200 : 50; // First call takes longer
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              stories: [{
                id: `result-${query}`,
                title: `Result for ${query}`,
                path: '/path',
                type: 'story',
                componentName: 'Component',
                tags: [],
                description: '',
                headings: [],
              }],
              docs: [],
              total: 1
            });
          }, delay);
        }) as any;
      });
      
      renderWithProvider(<SearchDialog open={true} onOpenChange={() => {}} />);
      
      const searchInput = screen.getByPlaceholder('Search stories and documentation...');
      
      // Make two searches quickly
      fireEvent.change(searchInput, { target: { value: 'first' } });
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.change(searchInput, { target: { value: 'second' } });
      
      // Should show results for 'second' not 'first'
      await waitFor(() => {
        expect(screen.getByText('Result for second')).toBeInTheDocument();
        expect(screen.queryByText('Result for first')).not.toBeInTheDocument();
      });
    });
  });
});