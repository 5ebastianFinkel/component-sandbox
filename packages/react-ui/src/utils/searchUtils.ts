import FlexSearch from 'flexsearch';
import { SearchResult } from './searchIndexBuilder';
import { searchCache } from './searchCache';

export interface SearchOptions {
  maxResults?: number;
  includeStories?: boolean;
  includeDocs?: boolean;
  boost?: {
    title?: number;
    componentName?: number;
    tags?: number;
    description?: number;
    headings?: number;
  };
}

export interface GroupedResults {
  stories: SearchResult[];
  docs: SearchResult[];
  total: number;
}

export class SearchEngine {
  private titleIndex: FlexSearch.Index;
  private contentIndex: FlexSearch.Index;
  private searchData: SearchResult[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.titleIndex = new FlexSearch.Index({
      tokenize: 'forward',
      threshold: 0,
      resolution: 9,
      cache: true
    });

    this.contentIndex = new FlexSearch.Index({
      tokenize: 'forward',
      threshold: 1,
      resolution: 7,
      cache: true
    });
  }

  buildIndex(data: SearchResult[]) {
    this.searchData = data;
    
    // Clear existing indices
    this.titleIndex.clear();
    this.contentIndex.clear();
    
    data.forEach((item, idx) => {
      // Build title-focused index (higher priority)
      const titleText = [
        item.title,
        item.componentName || '',
      ].filter(Boolean).join(' ');
      
      this.titleIndex.add(idx, titleText);

      // Build content index (broader search)
      const contentText = [
        item.title,
        item.componentName || '',
        ...(item.tags || []),
        ...(item.headings || []),
        item.description || ''
      ].filter(Boolean).join(' ');
      
      this.contentIndex.add(idx, contentText);
    });

    this.isInitialized = true;
  }

  search(query: string, options: SearchOptions = {}): SearchResult[] {
    if (!query.trim() || !this.isInitialized) return [];
    
    const {
      maxResults = 50,
      includeStories = true,
      includeDocs = true,
      boost = {
        title: 3,
        componentName: 2.5,
        tags: 2,
        description: 1.5,
        headings: 1
      }
    } = options;

    // Search in both indices
    const titleResults = this.titleIndex.search(query, { limit: maxResults * 2 });
    const contentResults = this.contentIndex.search(query, { limit: maxResults * 2 });

    // Combine and score results
    const scoredResults = new Map<number, { result: SearchResult; score: number }>();

    // Process title results (higher score)
    titleResults.forEach((idx: any) => {
      const result = this.searchData[idx];
      if (result && this.shouldIncludeResult(result, includeStories, includeDocs)) {
        const score = this.calculateScore(result, query, boost, true);
        scoredResults.set(idx, { result, score });
      }
    });

    // Process content results (lower score if not already found)
    contentResults.forEach((idx: any) => {
      const result = this.searchData[idx];
      if (result && this.shouldIncludeResult(result, includeStories, includeDocs)) {
        if (!scoredResults.has(idx)) {
          const score = this.calculateScore(result, query, boost, false);
          scoredResults.set(idx, { result, score });
        }
      }
    });

    // Sort by score and return results
    return Array.from(scoredResults.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.result);
  }

  private shouldIncludeResult(result: SearchResult, includeStories: boolean, includeDocs: boolean): boolean {
    if (result.type === 'story' && !includeStories) return false;
    if (result.type === 'docs' && !includeDocs) return false;
    return true;
  }

  private calculateScore(
    result: SearchResult, 
    query: string, 
    boost: NonNullable<SearchOptions['boost']>,
    fromTitleIndex: boolean
  ): number {
    const lowerQuery = query.toLowerCase();
    let score = fromTitleIndex ? 10 : 5; // Base score boost for title matches

    // Exact title match gets highest score
    if (result.title.toLowerCase().includes(lowerQuery)) {
      score += (boost.title || 3) * 10;
    }

    // Component name match
    if (result.componentName?.toLowerCase().includes(lowerQuery)) {
      score += (boost.componentName || 2.5) * 8;
    }

    // Tag matches
    if (result.tags) {
      const tagMatches = result.tags.filter(tag => 
        tag.toLowerCase().includes(lowerQuery)
      ).length;
      score += tagMatches * (boost.tags || 2) * 5;
    }

    // Description match
    if (result.description?.toLowerCase().includes(lowerQuery)) {
      score += (boost.description || 1.5) * 3;
    }

    // Heading matches
    if (result.headings) {
      const headingMatches = result.headings.filter(heading => 
        heading.toLowerCase().includes(lowerQuery)
      ).length;
      score += headingMatches * (boost.headings || 1) * 2;
    }

    // Boost for exact word matches
    const words = lowerQuery.split(' ');
    words.forEach(word => {
      if (result.title.toLowerCase().includes(word)) {
        score += 5;
      }
    });

    return score;
  }

  groupResults(results: SearchResult[]): GroupedResults {
    const grouped = results.reduce((acc, result) => {
      if (result.type === 'story') {
        acc.stories.push(result);
      } else {
        acc.docs.push(result);
      }
      return acc;
    }, { stories: [], docs: [] } as { stories: SearchResult[]; docs: SearchResult[] });

    return {
      ...grouped,
      total: results.length
    };
  }

  searchWithGrouping(query: string, options: SearchOptions = {}): GroupedResults {
    // Try to get from cache first
    const cacheKey = `${query}:${JSON.stringify(options)}`;
    const cachedResult = searchCache.get(cacheKey);
    
    if (cachedResult) {
      return cachedResult;
    }

    // Perform search
    const results = this.search(query, options);
    const groupedResults = this.groupResults(results);
    
    // Cache the result
    searchCache.set(cacheKey, groupedResults);
    
    return groupedResults;
  }

  // Debounced search for real-time input
  private searchTimeout: NodeJS.Timeout | null = null;

  searchDebounced(
    query: string,
    callback: (results: SearchResult[]) => void,
    options: SearchOptions = {},
    delay: number = 150
  ): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      const results = this.search(query, options);
      callback(results);
    }, delay);
  }

  // Get suggestions based on partial input
  getSuggestions(query: string, maxSuggestions: number = 5): string[] {
    if (!query.trim() || query.length < 2) return [];

    const results = this.search(query, { maxResults: maxSuggestions * 3 });
    const suggestions = new Set<string>();

    results.forEach(result => {
      // Add component names as suggestions
      if (result.componentName && 
          result.componentName.toLowerCase().startsWith(query.toLowerCase())) {
        suggestions.add(result.componentName);
      }

      // Add tags as suggestions
      result.tags?.forEach(tag => {
        if (tag.toLowerCase().startsWith(query.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  clear() {
    this.titleIndex.clear();
    this.contentIndex.clear();
    this.searchData = [];
    this.isInitialized = false;
  }
}