# Search Index Building Guide

This guide explains how to create and maintain the search index for the Storybook Search Dialog component ahead of time.

## Overview

The search dialog can work with either:
1. **Pre-built static index** (recommended for production)
2. **Dynamic index** (fallback for development)

## Methods to Build Search Index

### 1. Using NPM Scripts (Recommended)

The search index is automatically built when you run Storybook or build commands. The following scripts are already configured in your `package.json`:

```json
{
  "scripts": {
    "build-index": "tsx scripts/build-search-index.ts",
    "build": "npm run build-index && tsc -b && vite build",
    "build-storybook": "npm run build-index && storybook build",
    "storybook": "storybook dev -p 6007"
  }
}
```

**To build the search index manually:**
```bash
npm run build-index
```

### 2. Using Vite Plugin (Optional)

For automatic rebuilding during development, add to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { searchIndexPlugin } from './src/utils/viteSearchPlugin';

export default defineConfig({
  plugins: [
    // other plugins
    searchIndexPlugin({
      srcPath: './src',
      outputPath: './public/search-index.json',
      watch: true // Rebuild on file changes in dev
    })
  ]
});
```

### 3. Programmatic API

```typescript
import { StaticIndexBuilder } from './src/utils/indexBuilder';

async function buildIndex() {
  const builder = new StaticIndexBuilder('./src');
  await builder.buildFromFiles();
  await builder.saveToFile('./public/search-index.json');
}

buildIndex();
```

## Configuration Options

### StorybookDataExtractor Options

Configure how the search dialog loads data:

```typescript
import { SearchDialog } from '@component-sandbox/react-ui';
import { StorybookDataExtractor } from './utils/storybookDataExtractor';

// Use pre-built index with fallback
const dataExtractor = new StorybookDataExtractor({
  usePrebuiltIndex: true,           // Try to load pre-built index first
  indexPath: '/search-index.json',  // Path to the JSON file
  fallbackToStatic: true            // Use static data if pre-built fails
});

// Pass to SearchDialog
<SearchDialog 
  dataExtractor={dataExtractor}
  // other props
/>
```

### Index Builder Options

```typescript
import { StaticIndexBuilder } from './utils/indexBuilder';

const builder = new StaticIndexBuilder('./src');

// Build index
const searchData = await builder.buildFromFiles();

// Save to custom location
await builder.saveToFile('./dist/my-search-index.json');

// Load from file
const loadedData = StaticIndexBuilder.loadFromFile('./dist/my-search-index.json');
```

## File Structure

The index builder automatically scans for:

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.stories.tsx     ✅ Indexed
│   │   └── Button.tsx
│   └── Card/
│       ├── Card.stories.ts        ✅ Indexed
│       └── Card.tsx
├── stories/
│   ├── Introduction.mdx           ✅ Indexed
│   └── Tutorial.mdx               ✅ Indexed
└── docs/
    └── API.mdx                    ✅ Indexed
```

## Output Format

The generated `search-index.json` contains:

```json
[
  {
    "id": "button-component-main",
    "title": "Components/Button",
    "type": "story",
    "path": "?path=/story/components-button--default",
    "tags": ["ui", "component", "button"],
    "description": "A reusable button component",
    "componentName": "Button"
  },
  {
    "id": "api-documentation",
    "title": "API Documentation", 
    "type": "docs",
    "path": "?path=/docs/api-documentation--page",
    "headings": ["Getting Started", "Props", "Examples"],
    "tags": ["documentation", "api"],
    "description": "Complete API reference"
  }
]
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Build Storybook
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run build-index    # Build search index
      - run: npm run build-storybook
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./storybook-static
```

### Netlify

Add to your `netlify.toml`:

```toml
[build]
  command = "npm run build-storybook"  # build-index runs automatically
  publish = "storybook-static"
```

### Vercel

Add to your `vercel.json`:

```json
{
  "buildCommand": "npm run build-storybook",  // build-index runs automatically
  "outputDirectory": "storybook-static"
}
```

## Development Workflow

### 1. Development Mode

During development, the search dialog will:
1. Try to load pre-built index from `/search-index.json`
2. Fall back to static data if the file doesn't exist
3. Automatically rebuild index when files change (with Vite plugin)

### 2. Production Mode

For production deployments:
1. Build the search index as part of your build process
2. Include `search-index.json` in your static assets
3. The search dialog will load the pre-built index for optimal performance

## Performance Considerations

### Index Size
- **Small projects** (<50 components): ~10-50KB
- **Medium projects** (50-200 components): ~50-200KB  
- **Large projects** (200+ components): ~200KB-1MB

### Build Time
- **Initial build**: 100-500ms
- **Incremental rebuild**: 50-100ms (with file watching)

### Runtime Performance
- **Index loading**: ~10-50ms
- **Search latency**: ~5-20ms
- **Memory usage**: ~1-5MB

## Troubleshooting

### Common Issues

1. **Index file not found**
   ```
   Failed to fetch search index: 404
   ```
   **Solution**: Ensure `npm run build-index` runs before build/deploy

2. **TypeScript errors**
   ```
   Cannot find module 'fs'
   ```
   **Solution**: Index builder runs in Node.js environment, not browser

3. **Empty search results**
   ```
   No search data available and fallback disabled
   ```
   **Solution**: Enable fallback or check index file exists

### Debug Mode

Enable debug logging:

```typescript
const dataExtractor = new StorybookDataExtractor({
  usePrebuiltIndex: true,
  fallbackToStatic: true
});

// Check what data is loaded
console.log(await dataExtractor.extractAllData());
```

## Advanced Usage

### Custom File Parsing

Extend the index builder for custom file types:

```typescript
class CustomIndexBuilder extends StaticIndexBuilder {
  async processCustomFile(filePath: string): Promise<void> {
    // Your custom parsing logic
    const content = fs.readFileSync(filePath, 'utf-8');
    // Process and add to index...
  }
}
```

### Multiple Indexes

Build separate indexes for different sections:

```typescript
// Build component index
const componentBuilder = new StaticIndexBuilder('./src/components');
await componentBuilder.saveToFile('./public/components-index.json');

// Build docs index
const docsBuilder = new StaticIndexBuilder('./src/docs');  
await docsBuilder.saveToFile('./public/docs-index.json');
```

### Index Validation

Validate index integrity:

```typescript
function validateIndex(data: SearchResult[]): boolean {
  return data.every(item => 
    item.id && 
    item.title && 
    item.type && 
    item.path
  );
}

const isValid = validateIndex(searchData);
if (!isValid) {
  throw new Error('Invalid search index');
}
```

This approach gives you complete control over when and how your search index is built, ensuring optimal performance and reliability in production environments.