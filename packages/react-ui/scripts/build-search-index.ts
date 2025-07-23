#!/usr/bin/env tsx

import { buildSearchIndex } from '../src/utils/indexBuilder';

// Run the build process
buildSearchIndex().catch((error) => {
  console.error('Failed to build search index:', error);
  process.exit(1);
});