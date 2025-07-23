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
function categorizeError(error: Error, context: { srcPath: string; outputPath: string; attempt: number }) {
  const message = error.message || 'Unknown error';
  
  // File system errors
  if (message.includes('ENOENT') || message.includes('no such file')) {
    return {
      message: `Source directory not found: ${context.srcPath}`,
      isRetryable: false,
      resolution: `Ensure the srcPath '${context.srcPath}' exists and contains story/MDX files`
    };
  }
  
  if (message.includes('EACCES') || message.includes('permission denied')) {
    return {
      message: `Permission denied accessing files in: ${context.srcPath}`,
      isRetryable: false,
      resolution: 'Check file/directory permissions for the search index plugin'
    };
  }
  
  if (message.includes('EMFILE') || message.includes('too many open files')) {
    return {
      message: 'Too many files open during index building',
      isRetryable: true,
      resolution: 'Increase system file descriptor limits or reduce concurrent operations'
    };
  }
  
  // Parse/processing errors
  if (message.includes('SyntaxError') || message.includes('parse')) {
    return {
      message: `Failed to parse story/MDX files during index building`,
      isRetryable: false,
      resolution: 'Check for syntax errors in .stories.* and .mdx files'
    };
  }
  
  // Network/temporary errors
  if (message.includes('ETIMEDOUT') || message.includes('timeout')) {
    return {
      message: 'Timeout during index building process',
      isRetryable: true,
      resolution: 'Check system performance and reduce concurrent operations'
    };
  }
  
  // Write errors
  if (message.includes('ENOSPC') || message.includes('no space left')) {
    return {
      message: `No space left to write index file: ${context.outputPath}`,
      isRetryable: false,
      resolution: 'Free up disk space or choose a different output path'
    };
  }
  
  // Generic/unknown errors
  return {
    message: `Search index building failed: ${message}`,
    isRetryable: context.attempt === 1, // Only retry unknown errors once
    resolution: 'Check the console for detailed error information and verify file paths'
  };
}

export function searchIndexPlugin(options: SearchPluginOptions = {}): Plugin {
  // Validate and extract options with defaults
  const {
    srcPath = './src',
    outputPath = './public/search-index.json',
    watch = true
  } = options;

  // Validate path strings are not empty or just whitespace
  if (!srcPath.trim()) {
    throw new Error('searchIndexPlugin: srcPath cannot be empty or whitespace');
  }
  if (!outputPath.trim()) {
    throw new Error('searchIndexPlugin: outputPath cannot be empty or whitespace');
  }

  // Validate paths don't contain potentially dangerous characters
  const dangerousChars = /[<>:"|?*\u0000-\u001f]/;
  if (dangerousChars.test(srcPath)) {
    throw new Error('searchIndexPlugin: srcPath contains invalid characters');
  }
  if (dangerousChars.test(outputPath)) {
    throw new Error('searchIndexPlugin: outputPath contains invalid characters');
  }

  return {
    name: 'search-index',
    
    async buildStart() {
      console.log('🔍 Building search index...');
      
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`📁 Scanning source files in: ${srcPath}`);
          const builder = new StaticIndexBuilder(srcPath);
          
          console.log('🔨 Building index from discovered files...');
          await builder.buildFromFiles();
          
          console.log(`💾 Saving index to: ${outputPath}`);
          await builder.saveToFile(outputPath);
          
          console.log('✅ Search index built successfully');
          return; // Success, exit retry loop
          
        } catch (error) {
          const errorContext = categorizeError(error as Error, { srcPath, outputPath, attempt });
          
          if (attempt < maxRetries && errorContext.isRetryable) {
            console.warn(`⚠️  ${errorContext.message} (attempt ${attempt}/${maxRetries})`);
            console.log(`🔄 Retrying in ${attempt * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            continue;
          }
          
          // Final attempt failed or non-retryable error
          console.error(`❌ ${errorContext.message}`);
          if (errorContext.resolution) {
            console.log(`💡 Resolution: ${errorContext.resolution}`);
          }
          
          // Don't throw - allow build to continue without search functionality
          console.warn('⚠️  Continuing build without search index functionality');
          break;
        }
      }
    },

    configureServer(server) {
      if (!watch) return;

      // Watch patterns for files that should trigger index rebuilds
      const watchPatterns = [
        /\.stories\.(ts|tsx|js|jsx)$/,
        /\.mdx$/
      ];

      // Debounce rebuild to prevent excessive rebuilds during rapid file changes
      let rebuildTimeout: NodeJS.Timeout | null = null;
      const debounceDelay = 300; // 300ms debounce

      const debouncedRebuild = async (changedFile: string) => {
        console.log(`🔄 Rebuilding search index due to change in ${changedFile}`);
        
        const maxRetries = 2; // Fewer retries for file watching
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const builder = new StaticIndexBuilder(srcPath);
            await builder.buildFromFiles();
            await builder.saveToFile(outputPath);
            console.log('✅ Search index rebuilt successfully');
            break; // Success, exit retry loop
            
          } catch (error) {
            const errorContext = categorizeError(error as Error, { srcPath, outputPath, attempt });
            
            if (attempt < maxRetries && errorContext.isRetryable) {
              console.warn(`⚠️  ${errorContext.message} (retry ${attempt}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 500)); // Shorter delay for file watching
              continue;
            }
            
            // Final attempt failed or non-retryable error
            console.error(`❌ ${errorContext.message}`);
            if (errorContext.resolution) {
              console.log(`💡 Resolution: ${errorContext.resolution}`);
            }
            console.warn('⚠️  Search index may be out of date');
            break;
          }
        }
      };

      // Rebuild index when files change
      server.ws.on('file-change', async (file) => {
        // Check if the changed file matches any of our watch patterns
        const isRelevantFile = watchPatterns.some(pattern => pattern.test(file));

        if (isRelevantFile) {
          // Clear existing timeout and set a new one for debouncing
          if (rebuildTimeout) {
            clearTimeout(rebuildTimeout);
          }
          
          rebuildTimeout = setTimeout(() => {
            debouncedRebuild(file).catch(error => {
              console.error('Error during debounced rebuild:', error);
            });
          }, debounceDelay);
        }
      });
    }
  };
}