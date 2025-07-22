export interface SearchResult {
  id: string;
  title: string;
  type: 'story' | 'docs';
  path: string;
  tags?: string[];
  headings?: string[];
  matches?: MatchInfo[];
  description?: string;
  componentName?: string;
}

export interface MatchInfo {
  field: string;
  text: string;
  indices: number[];
}

export interface StoryMeta {
  title: string;
  component?: any;
  tags?: string[];
  parameters?: {
    docs?: {
      description?: {
        component?: string;
      };
    };
  };
}

export interface StoryExport {
  [key: string]: any;
}

export class SearchIndexBuilder {
  private searchData: SearchResult[] = [];

  addStory(id: string, title: string, path: string, tags?: string[], description?: string, componentName?: string) {
    this.searchData.push({
      id,
      title,
      type: 'story',
      path,
      tags,
      description,
      componentName
    });
  }

  addDocs(id: string, title: string, path: string, headings: string[], tags?: string[], description?: string) {
    this.searchData.push({
      id,
      title,
      type: 'docs',
      path,
      headings,
      tags,
      description
    });
  }

  parseStoryFile(filePath: string, fileContent: string): SearchResult[] {
    const results: SearchResult[] = [];
    
    try {
      // Extract meta information
      const metaMatch = fileContent.match(/const meta = {([\s\S]*?)} satisfies Meta/);
      if (!metaMatch) return results;

      // Extract title
      const titleMatch = fileContent.match(/title:\s*['"`](.*?)['"`]/);
      const title = titleMatch ? titleMatch[1] : 'Unknown Component';

      // Extract tags
      const tagsMatch = fileContent.match(/tags:\s*\[(.*?)\]/);
      const tags = tagsMatch ? 
        tagsMatch[1].split(',').map(tag => tag.trim().replace(/['"`]/g, '')) : 
        [];

      // Extract description
      const descMatch = fileContent.match(/description:\s*{\s*component:\s*['"`](.*?)['"`]/);
      const description = descMatch ? descMatch[1] : undefined;

      // Extract component name from title
      const componentName = title.split('/').pop();

      // Extract story exports
      const storyExports = this.extractStoryExports(fileContent);

      // Add main component story
      results.push({
        id: `${filePath}:main`,
        title: title,
        type: 'story',
        path: filePath,
        tags,
        description,
        componentName
      });

      // Add individual story variants
      storyExports.forEach((storyName) => {
        results.push({
          id: `${filePath}:${storyName}`,
          title: `${title} - ${storyName}`,
          type: 'story',
          path: `${filePath}?path=/story/${title.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-')}--${storyName.toLowerCase()}`,
          tags: [...tags, storyName],
          description,
          componentName
        });
      });

    } catch (error) {
      console.warn('Failed to parse story file:', filePath, error);
    }

    return results;
  }

  parseMdxFile(filePath: string, fileContent: string): SearchResult[] {
    const results: SearchResult[] = [];
    
    try {
      // Extract title from Meta or first heading
      let title = 'Documentation';
      const metaTitleMatch = fileContent.match(/<Meta title=['"`](.*?)['"`]/);
      if (metaTitleMatch) {
        title = metaTitleMatch[1];
      } else {
        const firstHeadingMatch = fileContent.match(/^#\s+(.+)$/m);
        if (firstHeadingMatch) {
          title = firstHeadingMatch[1];
        }
      }

      // Extract all headings
      const headings: string[] = [];
      const headingMatches = fileContent.matchAll(/^(#{1,6})\s+(.+)$/gm);
      for (const match of headingMatches) {
        headings.push(match[2]);
      }

      // Extract tags from frontmatter or content
      const tags: string[] = [];
      const tagsMatch = fileContent.match(/tags:\s*\[(.*?)\]/);
      if (tagsMatch) {
        tags.push(...tagsMatch[1].split(',').map(tag => tag.trim().replace(/['"`]/g, '')));
      }

      // Extract description from first paragraph
      const descMatch = fileContent.match(/^(.*?\.)$/m);
      const description = descMatch ? descMatch[1] : undefined;

      results.push({
        id: filePath,
        title: title,
        type: 'docs',
        path: filePath,
        headings,
        tags,
        description
      });

    } catch (error) {
      console.warn('Failed to parse MDX file:', filePath, error);
    }

    return results;
  }

  private extractStoryExports(fileContent: string): string[] {
    const exports: string[] = [];
    
    // Find all export statements that look like story exports
    const exportMatches = fileContent.matchAll(/export const (\w+): Story/g);
    for (const match of exportMatches) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  buildFromStorybookData(storybookData: { stories: any[], docs: any[] }) {
    this.clear();
    
    // Process stories
    storybookData.stories.forEach(story => {
      this.addStory(
        story.id,
        story.title,
        story.path,
        story.tags,
        story.description,
        story.componentName
      );
    });

    // Process docs
    storybookData.docs.forEach(doc => {
      this.addDocs(
        doc.id,
        doc.title,
        doc.path,
        doc.headings || [],
        doc.tags,
        doc.description
      );
    });
  }

  getSearchData(): SearchResult[] {
    return this.searchData;
  }

  clear() {
    this.searchData = [];
  }
}