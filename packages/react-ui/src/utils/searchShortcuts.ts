import { SearchOptions } from './searchUtils';

export interface SearchShortcut {
  prefix: string;
  description: string;
  icon?: string;
  transform: (query: string) => { query: string; options: SearchOptions };
}

export const searchShortcuts: SearchShortcut[] = [
  {
    prefix: 'd:',
    description: 'Search documentation only',
    icon: '📄',
    transform: (query: string) => ({
      query: query.substring(2).trim(),
      options: { includeStories: false, includeDocs: true }
    })
  },
  {
    prefix: 's:',
    description: 'Search stories only',
    icon: '🎨',
    transform: (query: string) => ({
      query: query.substring(2).trim(),
      options: { includeStories: true, includeDocs: false }
    })
  },
  {
    prefix: 'c:',
    description: 'Search by component name',
    icon: '🧩',
    transform: (query: string) => ({
      query: query.substring(2).trim(),
      options: { 
        boost: { 
          componentName: 5, 
          title: 3, 
          tags: 1, 
          description: 1,
          headings: 1 
        } 
      }
    })
  },
  {
    prefix: 't:',
    description: 'Search by tags',
    icon: '🏷️',
    transform: (query: string) => ({
      query: query.substring(2).trim(),
      options: { 
        boost: { 
          tags: 5, 
          title: 2, 
          componentName: 2, 
          description: 1,
          headings: 1 
        } 
      }
    })
  },
  {
    prefix: 'h:',
    description: 'Search headings in documentation',
    icon: '📑',
    transform: (query: string) => ({
      query: query.substring(2).trim(),
      options: { 
        includeDocs: true,
        includeStories: false,
        boost: { 
          headings: 5, 
          title: 3, 
          description: 2,
          tags: 1,
          componentName: 1 
        } 
      }
    })
  },
  {
    prefix: 'new:',
    description: 'Search recently added content',
    icon: '✨',
    transform: (query: string) => ({
      query: query.substring(4).trim(),
      options: { 
        maxResults: 20,
        // This would ideally filter by creation date if we had that data
      }
    })
  }
];

export class SearchShortcutProcessor {
  
  /**
   * Check if query contains a shortcut
   */
  static hasShortcut(query: string): boolean {
    return searchShortcuts.some(shortcut => 
      query.toLowerCase().startsWith(shortcut.prefix.toLowerCase())
    );
  }

  /**
   * Process query with shortcuts
   */
  static processQuery(query: string): { query: string; options: SearchOptions } | null {
    const lowerQuery = query.toLowerCase();
    
    const matchingShortcut = searchShortcuts.find(shortcut => 
      lowerQuery.startsWith(shortcut.prefix.toLowerCase())
    );

    if (matchingShortcut) {
      return matchingShortcut.transform(query);
    }

    return null;
  }

  /**
   * Get available shortcuts for display
   */
  static getShortcuts(): SearchShortcut[] {
    return searchShortcuts;
  }

  /**
   * Get shortcut suggestions based on partial input
   */
  static getShortcutSuggestions(partial: string): SearchShortcut[] {
    if (!partial.trim()) return searchShortcuts;

    const lowerPartial = partial.toLowerCase();
    return searchShortcuts.filter(shortcut =>
      shortcut.prefix.toLowerCase().startsWith(lowerPartial) ||
      shortcut.description.toLowerCase().includes(lowerPartial)
    );
  }

  /**
   * Format shortcut for display
   */
  static formatShortcut(shortcut: SearchShortcut): string {
    return `${shortcut.icon || '🔍'} ${shortcut.prefix} ${shortcut.description}`;
  }

  /**
   * Get help text for shortcuts
   */
  static getHelpText(): string {
    return searchShortcuts
      .map(shortcut => this.formatShortcut(shortcut))
      .join('\n');
  }
}

// Common search patterns
export const commonSearchPatterns = [
  'button',
  'form',
  'modal',
  'dialog',
  'navigation',
  'chart',
  'table',
  'card',
  'icon',
  'layout'
];

// Search tips
export const searchTips = [
  'Use quotes for exact matches: "exact phrase"',
  'Use shortcuts like s: for stories only',
  'Try searching by component names',
  'Search for tags like "accessibility" or "form"',
  'Look for documentation with d: prefix'
];