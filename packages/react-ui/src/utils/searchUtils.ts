import FlexSearch from 'flexsearch';
import { SearchResult } from './searchIndexBuilder';

export class SearchEngine {
  private index: FlexSearch.Index;
  private searchData: SearchResult[] = [];

  constructor() {
    this.index = new FlexSearch.Index({
      tokenize: 'forward',
      threshold: 0,
      resolution: 9,
      cache: true
    });
  }

  buildIndex(data: SearchResult[]) {
    this.searchData = data;
    
    data.forEach((item, idx) => {
      const searchableText = [
        item.title,
        ...(item.tags || []),
        ...(item.headings || [])
      ].join(' ');
      
      this.index.add(idx, searchableText);
    });
  }

  search(query: string, maxResults: number = 50): SearchResult[] {
    if (!query.trim()) return [];
    
    const results = this.index.search(query, { limit: maxResults });
    
    return results.map(idx => this.searchData[idx as number]).filter(Boolean);
  }

  groupResults(results: SearchResult[]): { stories: SearchResult[]; docs: SearchResult[] } {
    return results.reduce((acc, result) => {
      if (result.type === 'story') {
        acc.stories.push(result);
      } else {
        acc.docs.push(result);
      }
      return acc;
    }, { stories: [], docs: [] } as { stories: SearchResult[]; docs: SearchResult[] });
  }
}