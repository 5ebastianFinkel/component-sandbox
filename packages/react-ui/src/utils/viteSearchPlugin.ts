import type { Plugin } from 'vite';
import { StaticIndexBuilder } from './indexBuilder';

interface SearchPluginOptions {
  srcPath?: string;
  outputPath?: string;
  watch?: boolean;
}

/**
 * Creates a Vite plugin that automatically builds and updates a search index from source files during both development and build processes.
 *
 * The plugin generates a search index from story and MDX files in the specified source directory, saving the result to a configurable output path. During development, it watches for changes to relevant files and rebuilds the index as needed.
 *
 * @returns A Vite plugin that manages search index generation and updates.
 */
export function searchIndexPlugin(options: SearchPluginOptions = {}): Plugin {
  const {
    srcPath = './src',
    outputPath = './public/search-index.json',
    watch = true
  } = options;

  return {
    name: 'search-index',
    
    async buildStart() {
      console.log('🔍 Building search index...');
      
      try {
        const builder = new StaticIndexBuilder(srcPath);
        await builder.buildFromFiles();
        await builder.saveToFile(outputPath);
      } catch (error) {
        console.error('Failed to build search index:', error);
      }
    },

    configureServer(server) {
      if (!watch) return;

      // Watch for changes to story and MDX files
      const watchPatterns = [
        `${srcPath}/**/*.stories.{ts,tsx,js,jsx}`,
        `${srcPath}/**/*.mdx`
      ];

      // Rebuild index when files change
      server.ws.on('file-change', async (file) => {
        const isRelevantFile = watchPatterns.some(pattern => 
          file.includes('.stories.') || file.includes('.mdx')
        );

        if (isRelevantFile) {
          console.log(`🔄 Rebuilding search index due to change in ${file}`);
          try {
            const builder = new StaticIndexBuilder(srcPath);
            await builder.buildFromFiles();
            await builder.saveToFile(outputPath);
          } catch (error) {
            console.error('Failed to rebuild search index:', error);
          }
        }
      });
    }
  };
}