import { parse } from '@babel/parser';
import * as t from '@babel/types';

// Utility function to generate Storybook story IDs (replacement for @storybook/router toId)
function toId(title: string, storyName = 'default'): string {
  const sanitize = (str: string) => 
    str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  
  const titleId = sanitize(title);
  const storyId = sanitize(storyName);
  
  return storyName === 'default' ? titleId : `${titleId}--${storyId}`;
}

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

export interface StorybookStoryData {
  id: string;
  title: string;
  path: string;
  tags?: string[];
  description?: string;
  componentName?: string;
}

export interface StorybookDocsData {
  id: string;
  title: string;
  path: string;
  headings?: string[];
  tags?: string[];
  description?: string;
}

export interface StorybookData {
  stories: StorybookStoryData[];
  docs: StorybookDocsData[];
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
      // Parse the file using Babel AST
      const ast = parse(fileContent, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx']
      });

      // Extract meta information using AST
      const metaInfo = this.extractMetaFromAST(ast);
      if (!metaInfo) return results;

      const { title, tags, description } = metaInfo;
      const componentName = title.split('/').pop();

      // Extract story exports using AST
      const storyExports = this.extractStoryExportsFromAST(ast);

      // Generate proper Storybook ID for the main story 
      const mainStoryId = toId(title, 'default');

      // Add main component story
      results.push({
        id: `${filePath}:main`,
        title: title,
        type: 'story',
        path: `/?path=/story/${mainStoryId}`,
        tags,
        description,
        componentName
      });

      // Add individual story variants
      storyExports.forEach((storyName) => {
        const storyId = toId(title, storyName);
        results.push({
          id: `${filePath}:${storyName}`,
          title: `${title} - ${storyName}`,
          type: 'story',
          path: `/?path=/story/${storyId}`,
          tags: [...tags, storyName],
          description,
          componentName
        });
      });

    } catch (error) {
      console.warn('Failed to parse story file with AST:', filePath, error);
      // Fallback to regex-based parsing for malformed files
      return this.parseStoryFileWithRegex(filePath, fileContent);
    }

    // Add results to internal searchData
    this.searchData.push(...results);
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

      // Generate proper Storybook docs URL
      const docsId = toId(title, 'docs');
      const storybookPath = `/?path=/docs/${docsId}`;

      results.push({
        id: filePath,
        title: title,
        type: 'docs',
        path: storybookPath,
        headings,
        tags,
        description
      });

    } catch (error) {
      console.warn('Failed to parse MDX file:', filePath, error);
    }

    // Add results to internal searchData
    this.searchData.push(...results);
    return results;
  }

  private extractMetaFromAST(ast: t.File): { title: string; tags: string[]; description?: string } | null {
    let metaInfo: { title: string; tags: string[]; description?: string } | null = null;

    // Traverse AST to find meta declaration
    for (const node of ast.program.body) {
      if (t.isVariableDeclaration(node)) {
        for (const declarator of node.declarations) {
          if (
            t.isVariableDeclarator(declarator) &&
            t.isIdentifier(declarator.id) &&
            declarator.id.name === 'meta'
          ) {
            // Handle both direct object expressions and satisfies expressions
            let objectExpression: t.ObjectExpression | null = null;
            
            if (t.isObjectExpression(declarator.init)) {
              // Handle: const meta = { ... }
              objectExpression = declarator.init;
            } else if (t.isTSSatisfiesExpression(declarator.init) && t.isObjectExpression(declarator.init.expression)) {
              // Handle: const meta = { ... } satisfies Meta<...>
              objectExpression = declarator.init.expression;
            }
            
            if (objectExpression) {
              metaInfo = this.extractMetaProperties(objectExpression);
              break;
            }
          }
        }
      }
    }

    return metaInfo;
  }

  private extractMetaProperties(objectExpression: t.ObjectExpression): { title: string; tags: string[]; description?: string } {
    let title = 'Unknown Component';
    let tags: string[] = [];
    let description: string | undefined;

    for (const property of objectExpression.properties) {
      if (t.isObjectProperty(property) && t.isIdentifier(property.key)) {
        const key = property.key.name;

        if (key === 'title' && t.isStringLiteral(property.value)) {
          title = property.value.value;
        } else if (key === 'tags' && t.isArrayExpression(property.value)) {
          tags = property.value.elements
            .filter((el): el is t.StringLiteral => t.isStringLiteral(el))
            .map(el => el.value);
        } else if (key === 'parameters' && t.isObjectExpression(property.value)) {
          description = this.extractDescriptionFromParameters(property.value);
        }
      }
    }

    return { title, tags, description };
  }

  private extractDescriptionFromParameters(parametersObj: t.ObjectExpression): string | undefined {
    for (const prop of parametersObj.properties) {
      if (
        t.isObjectProperty(prop) &&
        t.isIdentifier(prop.key) &&
        prop.key.name === 'docs' &&
        t.isObjectExpression(prop.value)
      ) {
        for (const docsProp of prop.value.properties) {
          if (
            t.isObjectProperty(docsProp) &&
            t.isIdentifier(docsProp.key) &&
            docsProp.key.name === 'description' &&
            t.isObjectExpression(docsProp.value)
          ) {
            for (const descProp of docsProp.value.properties) {
              if (
                t.isObjectProperty(descProp) &&
                t.isIdentifier(descProp.key) &&
                descProp.key.name === 'component' &&
                t.isStringLiteral(descProp.value)
              ) {
                return descProp.value.value;
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  private extractStoryExportsFromAST(ast: t.File): string[] {
    const exports: string[] = [];

    for (const node of ast.program.body) {
      if (t.isExportNamedDeclaration(node) && t.isVariableDeclaration(node.declaration)) {
        for (const declarator of node.declaration.declarations) {
          if (
            t.isVariableDeclarator(declarator) &&
            t.isIdentifier(declarator.id) &&
            declarator.id.name !== 'meta' && // Exclude meta export
            declarator.id.name !== 'default' // Exclude default export
          ) {
            // Check if it has a type annotation indicating it's a Story
            const hasStoryType = node.declaration.declarations.some(decl => {
              if (t.isVariableDeclarator(decl) && 
                  decl.id === declarator.id &&
                  t.isIdentifier(decl.id) &&
                  decl.id.typeAnnotation &&
                  t.isTSTypeAnnotation(decl.id.typeAnnotation) &&
                  t.isTSTypeReference(decl.id.typeAnnotation.typeAnnotation) &&
                  t.isIdentifier(decl.id.typeAnnotation.typeAnnotation.typeName)) {
                return decl.id.typeAnnotation.typeAnnotation.typeName.name === 'Story';
              }
              return false;
            });

            if (hasStoryType || declarator.init) { // Include if has Story type or any initializer
              exports.push(declarator.id.name);
            }
          }
        }
      }
    }

    return exports;
  }

  private parseStoryFileWithRegex(filePath: string, fileContent: string): SearchResult[] {
    const results: SearchResult[] = [];
    
    try {
      // Extract meta information (fallback regex)
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
      const storyExports = this.extractStoryExportsWithRegex(fileContent);

      // Generate proper Storybook URLs
      const mainStoryId = toId(title, 'default');

      // Add main component story
      results.push({
        id: `${filePath}:main`,
        title: title,
        type: 'story',
        path: `/?path=/story/${mainStoryId}`,
        tags,
        description,
        componentName
      });

      // Add individual story variants
      storyExports.forEach((storyName) => {
        const storyId = toId(title, storyName);
        results.push({
          id: `${filePath}:${storyName}`,
          title: `${title} - ${storyName}`,
          type: 'story',
          path: `/?path=/story/${storyId}`,
          tags: [...tags, storyName],
          description,
          componentName
        });
      });

    } catch (error) {
      console.warn('Failed to parse story file with regex fallback:', filePath, error);
    }

    // Add results to internal searchData
    this.searchData.push(...results);
    return results;
  }

  private extractStoryExportsWithRegex(fileContent: string): string[] {
    const exports: string[] = [];
    
    // Find all export statements that look like story exports
    const exportMatches = fileContent.matchAll(/export const (\w+): Story/g);
    for (const match of exportMatches) {
      exports.push(match[1]);
    }
    
    return exports;
  }

  private validateStorybookData(data: any): data is StorybookData {
    if (!data || typeof data !== 'object') {
      console.warn('StorybookData validation failed: data is not an object');
      return false;
    }

    if (!Array.isArray(data.stories)) {
      console.warn('StorybookData validation failed: stories is not an array');
      return false;
    }

    if (!Array.isArray(data.docs)) {
      console.warn('StorybookData validation failed: docs is not an array');
      return false;
    }

    return true;
  }

  private validateStoryData(story: any, index: number): story is StorybookStoryData {
    if (!story || typeof story !== 'object') {
      console.warn(`Story validation failed at index ${index}: story is not an object`);
      return false;
    }

    // Required fields
    if (typeof story.id !== 'string' || !story.id.trim()) {
      console.warn(`Story validation failed at index ${index}: id must be a non-empty string`);
      return false;
    }

    if (typeof story.title !== 'string' || !story.title.trim()) {
      console.warn(`Story validation failed at index ${index}: title must be a non-empty string`);
      return false;
    }

    if (typeof story.path !== 'string' || !story.path.trim()) {
      console.warn(`Story validation failed at index ${index}: path must be a non-empty string`);
      return false;
    }

    // Optional fields validation
    if (story.tags !== undefined && !Array.isArray(story.tags)) {
      console.warn(`Story validation failed at index ${index}: tags must be an array if provided`);
      return false;
    }

    if (story.tags && !story.tags.every((tag: any) => typeof tag === 'string')) {
      console.warn(`Story validation failed at index ${index}: all tags must be strings`);
      return false;
    }

    if (story.description !== undefined && typeof story.description !== 'string') {
      console.warn(`Story validation failed at index ${index}: description must be a string if provided`);
      return false;
    }

    if (story.componentName !== undefined && typeof story.componentName !== 'string') {
      console.warn(`Story validation failed at index ${index}: componentName must be a string if provided`);
      return false;
    }

    return true;
  }

  private validateDocsData(doc: any, index: number): doc is StorybookDocsData {
    if (!doc || typeof doc !== 'object') {
      console.warn(`Docs validation failed at index ${index}: doc is not an object`);
      return false;
    }

    // Required fields
    if (typeof doc.id !== 'string' || !doc.id.trim()) {
      console.warn(`Docs validation failed at index ${index}: id must be a non-empty string`);
      return false;
    }

    if (typeof doc.title !== 'string' || !doc.title.trim()) {
      console.warn(`Docs validation failed at index ${index}: title must be a non-empty string`);
      return false;
    }

    if (typeof doc.path !== 'string' || !doc.path.trim()) {
      console.warn(`Docs validation failed at index ${index}: path must be a non-empty string`);
      return false;
    }

    // Optional fields validation
    if (doc.headings !== undefined && !Array.isArray(doc.headings)) {
      console.warn(`Docs validation failed at index ${index}: headings must be an array if provided`);
      return false;
    }

    if (doc.headings && !doc.headings.every((heading: any) => typeof heading === 'string')) {
      console.warn(`Docs validation failed at index ${index}: all headings must be strings`);
      return false;
    }

    if (doc.tags !== undefined && !Array.isArray(doc.tags)) {
      console.warn(`Docs validation failed at index ${index}: tags must be an array if provided`);
      return false;
    }

    if (doc.tags && !doc.tags.every((tag: any) => typeof tag === 'string')) {
      console.warn(`Docs validation failed at index ${index}: all tags must be strings`);
      return false;
    }

    if (doc.description !== undefined && typeof doc.description !== 'string') {
      console.warn(`Docs validation failed at index ${index}: description must be a string if provided`);
      return false;
    }

    return true;
  }

  buildFromStorybookData(storybookData: StorybookData) {
    this.clear();
    
    // Validate input data structure
    if (!this.validateStorybookData(storybookData)) {
      console.error('Invalid Storybook data structure provided to buildFromStorybookData');
      return;
    }
    
    // Process stories with validation
    if (Array.isArray(storybookData.stories)) {
      storybookData.stories.forEach((story, index) => {
        if (this.validateStoryData(story, index)) {
          this.addStory(
            story.id,
            story.title,
            story.path,
            story.tags,
            story.description,
            story.componentName
          );
        }
      });
    }

    // Process docs with validation
    if (Array.isArray(storybookData.docs)) {
      storybookData.docs.forEach((doc, index) => {
        if (this.validateDocsData(doc, index)) {
          this.addDocs(
            doc.id,
            doc.title,
            doc.path,
            doc.headings || [],
            doc.tags,
            doc.description
          );
        }
      });
    }
  }

  getSearchData(): SearchResult[] {
    return this.searchData;
  }

  clear() {
    this.searchData = [];
  }
}