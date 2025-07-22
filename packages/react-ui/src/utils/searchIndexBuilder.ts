export interface SearchResult {
  id: string;
  title: string;
  type: 'story' | 'docs';
  path: string;
  tags?: string[];
  headings?: string[];
  matches?: MatchInfo[];
}

export interface MatchInfo {
  field: string;
  text: string;
  indices: number[];
}

export class SearchIndexBuilder {
  private searchData: SearchResult[] = [];

  addStory(id: string, title: string, path: string, tags?: string[]) {
    this.searchData.push({
      id,
      title,
      type: 'story',
      path,
      tags
    });
  }

  addDocs(id: string, title: string, path: string, headings: string[], tags?: string[]) {
    this.searchData.push({
      id,
      title,
      type: 'docs',
      path,
      headings,
      tags
    });
  }

  getSearchData(): SearchResult[] {
    return this.searchData;
  }

  clear() {
    this.searchData = [];
  }
}