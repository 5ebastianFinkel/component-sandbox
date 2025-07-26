import { describe, it, expect } from 'vitest';
import { searchShortcuts, SearchShortcutProcessor } from './searchShortcuts';

describe('searchShortcuts', () => {
  describe('searchShortcuts array', () => {
    it('should contain all expected shortcuts', () => {
      const prefixes = searchShortcuts.map(s => s.prefix);
      expect(prefixes).toContain('s:');
      expect(prefixes).toContain('d:');
      expect(prefixes).toContain('c:');
      expect(prefixes).toContain('t:');
      expect(prefixes).toContain('h:');
      expect(prefixes).toContain('new:');
      expect(searchShortcuts).toHaveLength(6);
    });

    it('should have proper descriptions for each shortcut', () => {
      const shortcut = searchShortcuts.find(s => s.prefix === 's:');
      expect(shortcut).toBeDefined();
      expect(shortcut?.description).toBe('Search stories only');
      expect(shortcut?.icon).toBe('🎨');
    });
  });

  describe('SearchShortcutProcessor.hasShortcut', () => {
    it('should detect shortcuts at the beginning of query', () => {
      expect(SearchShortcutProcessor.hasShortcut('s: button')).toBe(true);
      expect(SearchShortcutProcessor.hasShortcut('d: api')).toBe(true);
      expect(SearchShortcutProcessor.hasShortcut('c: modal')).toBe(true);
      expect(SearchShortcutProcessor.hasShortcut('t: interactive')).toBe(true);
      expect(SearchShortcutProcessor.hasShortcut('h: installation')).toBe(true);
      expect(SearchShortcutProcessor.hasShortcut('new: guide')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(SearchShortcutProcessor.hasShortcut('S: button')).toBe(true);
      expect(SearchShortcutProcessor.hasShortcut('D: api')).toBe(true);
      expect(SearchShortcutProcessor.hasShortcut('NEW: guide')).toBe(true);
    });

    it('should not detect shortcuts in the middle of query', () => {
      expect(SearchShortcutProcessor.hasShortcut('button s: test')).toBe(false);
      expect(SearchShortcutProcessor.hasShortcut('no shortcut here')).toBe(false);
    });
  });

  describe('SearchShortcutProcessor.processQuery', () => {
    describe('s: shortcut (stories only)', () => {
      it('should transform query and set options for stories only', () => {
        const result = SearchShortcutProcessor.processQuery('s: button');
        expect(result).toBeDefined();
        expect(result?.query).toBe('button');
        expect(result?.options.includeStories).toBe(true);
        expect(result?.options.includeDocs).toBe(false);
      });

      it('should handle empty query after shortcut', () => {
        const result = SearchShortcutProcessor.processQuery('s: ');
        expect(result?.query).toBe('');
      });
    });

    describe('d: shortcut (docs only)', () => {
      it('should transform query and set options for docs only', () => {
        const result = SearchShortcutProcessor.processQuery('d: api');
        expect(result).toBeDefined();
        expect(result?.query).toBe('api');
        expect(result?.options.includeStories).toBe(false);
        expect(result?.options.includeDocs).toBe(true);
      });
    });

    describe('c: shortcut (component name boost)', () => {
      it('should transform query and boost component name', () => {
        const result = SearchShortcutProcessor.processQuery('c: modal');
        expect(result).toBeDefined();
        expect(result?.query).toBe('modal');
        expect(result?.options.boost?.componentName).toBe(5);
        expect(result?.options.boost?.title).toBe(3);
      });
    });

    describe('t: shortcut (tag boost)', () => {
      it('should transform query and boost tags', () => {
        const result = SearchShortcutProcessor.processQuery('t: interactive');
        expect(result).toBeDefined();
        expect(result?.query).toBe('interactive');
        expect(result?.options.boost?.tags).toBe(5);
        expect(result?.options.boost?.title).toBe(2);
      });
    });

    describe('h: shortcut (heading search)', () => {
      it('should transform query for heading search in docs', () => {
        const result = SearchShortcutProcessor.processQuery('h: typography');
        expect(result).toBeDefined();
        expect(result?.query).toBe('typography');
        expect(result?.options.includeDocs).toBe(true);
        expect(result?.options.includeStories).toBe(false);
        expect(result?.options.boost?.headings).toBe(5);
      });
    });

    describe('new: shortcut (recent content)', () => {
      it('should limit results to 20', () => {
        const result = SearchShortcutProcessor.processQuery('new: guide');
        expect(result).toBeDefined();
        expect(result?.query).toBe('guide');
        expect(result?.options.maxResults).toBe(20);
      });
    });

    it('should return null for queries without shortcuts', () => {
      expect(SearchShortcutProcessor.processQuery('regular query')).toBeNull();
      expect(SearchShortcutProcessor.processQuery('button component')).toBeNull();
    });

    it('should handle case insensitive shortcuts', () => {
      const result = SearchShortcutProcessor.processQuery('S: Button');
      expect(result).toBeDefined();
      expect(result?.query).toBe('Button');
    });
  });

  describe('SearchShortcutProcessor.getShortcuts', () => {
    it('should return all shortcuts', () => {
      const shortcuts = SearchShortcutProcessor.getShortcuts();
      expect(shortcuts).toEqual(searchShortcuts);
      expect(shortcuts).toHaveLength(6);
    });
  });

  describe('SearchShortcutProcessor.getShortcutSuggestions', () => {
    it('should return all shortcuts for empty input', () => {
      const suggestions = SearchShortcutProcessor.getShortcutSuggestions('');
      expect(suggestions).toHaveLength(6);
    });

    it('should filter shortcuts by prefix', () => {
      const suggestions = SearchShortcutProcessor.getShortcutSuggestions('s:');
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].prefix).toBe('s:');
    });

    it('should filter shortcuts by description', () => {
      const suggestions = SearchShortcutProcessor.getShortcutSuggestions('doc');
      const prefixes = suggestions.map(s => s.prefix);
      expect(prefixes).toContain('d:');
      expect(prefixes).toContain('h:');
    });

    it('should be case insensitive', () => {
      const suggestions = SearchShortcutProcessor.getShortcutSuggestions('NEW');
      expect(suggestions).toHaveLength(1);
      expect(suggestions[0].prefix).toBe('new:');
    });
  });

  describe('SearchShortcutProcessor.formatShortcut', () => {
    it('should format shortcut with icon', () => {
      const shortcut = searchShortcuts.find(s => s.prefix === 's:')!;
      const formatted = SearchShortcutProcessor.formatShortcut(shortcut);
      expect(formatted).toBe('🎨 s: Search stories only');
    });

    it('should use default icon if none provided', () => {
      const shortcut = {
        prefix: 'test:',
        description: 'Test shortcut',
        transform: (q: string) => ({ query: q, options: {} })
      };
      const formatted = SearchShortcutProcessor.formatShortcut(shortcut);
      expect(formatted).toBe('🔍 test: Test shortcut');
    });
  });

  describe('SearchShortcutProcessor.getHelpText', () => {
    it('should return formatted help text for all shortcuts', () => {
      const helpText = SearchShortcutProcessor.getHelpText();
      expect(helpText).toContain('s: Search stories only');
      expect(helpText).toContain('d: Search documentation only');
      expect(helpText).toContain('c: Search by component name');
      expect(helpText).toContain('t: Search by tags');
      expect(helpText).toContain('h: Search headings in documentation');
      expect(helpText).toContain('new: Search recently added content');
      expect(helpText.split('\n')).toHaveLength(6);
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in query', () => {
      const result = SearchShortcutProcessor.processQuery('s: @#$%^&*()');
      expect(result?.query).toBe('@#$%^&*()');
    });

    it('should handle very long queries', () => {
      const longQuery = 'a'.repeat(1000);
      const result = SearchShortcutProcessor.processQuery(`s: ${longQuery}`);
      expect(result?.query).toBe(longQuery);
    });

    it('should handle multiple colons in query', () => {
      const result = SearchShortcutProcessor.processQuery('s: test: with: colons');
      expect(result?.query).toBe('test: with: colons');
    });

    it('should handle whitespace properly', () => {
      const result = SearchShortcutProcessor.processQuery('s:    lots   of   spaces   ');
      expect(result?.query).toBe('lots   of   spaces');
    });

    it('should not process invalid shortcuts', () => {
      expect(SearchShortcutProcessor.processQuery('x: invalid')).toBeNull();
      expect(SearchShortcutProcessor.processQuery('ss: double')).toBeNull();
      expect(SearchShortcutProcessor.processQuery(':s backwards')).toBeNull();
    });
  });
});