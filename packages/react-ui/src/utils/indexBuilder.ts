import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { SearchIndexBuilder, SearchResult } from './searchIndexBuilder';

/**
 * Build search index from actual Storybook files
 */
export class StaticIndexBuilder {
  private indexBuilder: SearchIndexBuilder;
  private srcPath: string;

  constructor(srcPath: string = './src') {
    this.indexBuilder = new SearchIndexBuilder();
    this.srcPath = srcPath;
  }

  /**
   * Build index from all story and MDX files
   */
  async buildFromFiles(): Promise<SearchResult[]> {
    const storyFiles = await this.findStoryFiles();
    const mdxFiles = await this.findMdxFiles();

    console.log(`Found ${storyFiles.length} story files and ${mdxFiles.length} MDX files`);

    // Process story files
    for (const filePath of storyFiles) {
      await this.processStoryFile(filePath);
    }

    // Process MDX files
    for (const filePath of mdxFiles) {
      await this.processMdxFile(filePath);
    }

    return this.indexBuilder.getSearchData();
  }

  /**
   * Find all story files
   */
  private async findStoryFiles(): Promise<string[]> {
    const patterns = [
      `${this.srcPath}/**/*.stories.ts`,
      `${this.srcPath}/**/*.stories.tsx`,
      `${this.srcPath}/**/*.stories.js`,
      `${this.srcPath}/**/*.stories.jsx`
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern);
      files.push(...matches);
    }

    return files;
  }

  /**
   * Find all MDX files
   */
  private async findMdxFiles(): Promise<string[]> {
    return await glob(`${this.srcPath}/**/*.mdx`);
  }

  /**
   * Process a story file
   */
  private async processStoryFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const results = this.indexBuilder.parseStoryFile(filePath, content);
      
      console.log(`Processed ${filePath}: ${results.length} stories found`);
    } catch (error) {
      console.warn(`Failed to process story file ${filePath}:`, error);
    }
  }

  /**
   * Process an MDX file
   */
  private async processMdxFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const results = this.indexBuilder.parseMdxFile(filePath, content);
      
      console.log(`Processed ${filePath}: ${results.length} docs found`);
      if (results.length > 0) {
        console.log(`  - Title: ${results[0].title}`);
        console.log(`  - Headings: ${results[0].headings?.join(', ')}`);
      }
    } catch (error) {
      console.warn(`Failed to process MDX file ${filePath}:`, error);
    }
  }

  /**
   * Save index to JSON file
   */
  async saveToFile(outputPath: string): Promise<void> {
    const searchData = this.indexBuilder.getSearchData();
    const jsonData = JSON.stringify(searchData, null, 2);
    
    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, jsonData, 'utf-8');
    console.log(`Search index saved to ${outputPath} with ${searchData.length} entries`);
  }

  /**
   * Load index from JSON file
   */
  static loadFromFile(inputPath: string): SearchResult[] {
    try {
      const content = fs.readFileSync(inputPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load search index from ${inputPath}:`, error);
      return [];
    }
  }
}

/**
 * CLI script to build search index
 */
export async function buildSearchIndex() {
  const builder = new StaticIndexBuilder();
  
  console.log('Building search index from Storybook files...');
  const startTime = Date.now();
  
  try {
    await builder.buildFromFiles();
    await builder.saveToFile('./public/search-index.json');
    
    const duration = Date.now() - startTime;
    console.log(`✅ Search index built successfully in ${duration}ms`);
  } catch (error) {
    console.error('❌ Failed to build search index:', error);
    process.exit(1);
  }
}