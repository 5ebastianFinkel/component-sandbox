# Product Requirements Document: Storybook Search Dialog

## Overview
Implement a floating search dialog for Storybook that allows users to quickly search and navigate to stories and documentation using keyboard shortcuts.

## Technical Stack
- **Framework**: React
- **Styling**: CSS Modules
- **Search UI**: [cmdk](https://github.com/pacocoursey/cmdk)
- **Search Engine**: [FlexSearch](https://github.com/nextapps-de/flexsearch)
- **Content Sources**: Story files, MDX documentation files

## Core Requirements

### 1. Search Dialog UI
- Floating modal overlay that appears centered on screen
- Responsive design that works on desktop and mobile
- Smooth fade-in/fade-out animations
- Click outside to close functionality
- ESC key to close

### 2. Search Functionality
- Real-time search as user types
- Search across:
    - Story names
    - MDX file headings (h1, h2, h3, etc.)
    - Tags from stories and MDX files
- Display results grouped by type (Stories, Documentation)
- Keyboard navigation through results (arrow keys)
- Enter key to navigate to selected result

### 3. Keyboard Shortcut
- CMD+K (Mac) / CTRL+K (Windows/Linux) to open search
- Should work globally within Storybook

## Implementation Steps

### Step 1: Setup Base Infrastructure
**Goal**: Create the foundational components and utilities

**Tasks**:
1. Install dependencies:
   ```bash
   npm install cmdk flexsearch
   ```
2. Create base directory structure inside packages/react-ui
   ```
   src/
     components/
       SearchDialog/
         SearchDialog.tsx
         SearchDialog.module.css
         index.ts
     hooks/
       useKeyboardShortcut.ts
     utils/
       searchIndexBuilder.ts
       searchUtils.ts
   ```

**Acceptance Criteria**:
- Dependencies installed successfully
- Directory structure created
- Basic component files initialized

---

### Step 2: Implement Keyboard Shortcut Hook
**Goal**: Create a reusable hook for keyboard shortcuts

**Tasks**:
1. Create `useKeyboardShortcut.ts` hook
2. Handle CMD/CTRL key detection based on OS
3. Add event listener management (attach/detach)
4. Prevent default browser behavior for CMD+K

**Code Structure**:
```typescript
// hooks/useKeyboardShortcut.ts
export const useKeyboardShortcut = (key, callback, deps = []) => {
  // Implementation
}
```

**Acceptance Criteria**:
- Hook detects CMD+K on Mac, CTRL+K on Windows/Linux
- No memory leaks (proper cleanup)
- Works when any element has focus

---

### Step 3: Build Search Dialog Component
**Goal**: Create the UI shell using cmdk

**Tasks**:
1. Implement basic dialog structure with cmdk Command component
2. Add overlay background with click-to-close
3. Style with CSS modules:
    - Centered positioning
    - Backdrop blur
    - Smooth animations
4. Add search input with placeholder
5. Implement close handlers (ESC, click outside)
6. If possible use Popover-API

**Component Structure**:
```typescript
// components/SearchDialog/SearchDialog.tsx
import { Command } from 'cmdk'
import styles from './SearchDialog.module.css'

export const SearchDialog = ({ open, onOpenChange }) => {
  // Implementation
}
```

**Acceptance Criteria**:
- Dialog opens/closes smoothly
- Responsive on all screen sizes
- Keyboard navigation works
- Visual design matches Storybook theme

---

### Step 4: Create Search Index Builder
**Goal**: Extract searchable content from Storybook

**Tasks**:
1. Create utility to parse story metadata
2. Extract story names and tags
3. Parse MDX files to extract:
    - All heading text (h1-h6)
    - Frontmatter tags if present
4. Build FlexSearch index with proper configuration

**Data Structure**:
```typescript
{
  id: 'unique-id',
  title: 'Component Name',
  type: 'story' | 'docs',
  tags: ['tag1', 'tag2'],
  path: '/path/to/story',
  headings: ['Heading 1', 'Heading 2'] // for docs only
}
```

**Acceptance Criteria**:
- Extracts all story names correctly
- Parses MDX headings accurately
- Index builds without errors
- Tags are properly associated

---

### Step 5: Implement Search Logic
**Goal**: Connect FlexSearch with the UI

**Tasks**:
1. Initialize FlexSearch with optimal settings
2. Create search function that queries the index
3. Implement result ranking/scoring
4. Group results by type (Stories vs Documentation)
5. Add debouncing for search input

**Search Configuration**:
```typescript
const index = new FlexSearch.Index({
  tokenize: 'forward',
  threshold: 0,
  resolution: 9,
  cache: true
})
```

**Acceptance Criteria**:
- Search returns relevant results
- Results update in real-time
- Performance is smooth (no lag)
- Fuzzy matching works well

---

### Step 6: Integrate Search Results Display
**Goal**: Display search results in the dialog

**Tasks**:
1. Create result item component
2. Implement result grouping (Stories/Docs sections)
3. Add keyboard navigation with cmdk
4. Highlight matching text in results
5. Add icons for different result types

**Result Item Structure**:
```typescript
<Command.Item
  key={result.id}
  onSelect={() => navigateToResult(result)}
>
  <Icon type={result.type} />
  <span>{result.title}</span>
  {result.tags && <Tags items={result.tags} />}
</Command.Item>
```

**Acceptance Criteria**:
- Results are clearly organized
- Visual hierarchy is clear
- Keyboard navigation is smooth
- Selected state is visible

---

### Step 7: Add Navigation Handler
**Goal**: Navigate to selected search results

**Tasks**:
1. Create navigation utility for Storybook
2. Handle different result types:
    - Stories: Navigate to story view
    - Docs: Navigate to docs page (and scroll to heading if applicable)
3. Close dialog after navigation
4. Add loading state during navigation

**Acceptance Criteria**:
- Navigation works for all result types
- Correct story/doc page loads
- Dialog closes after selection
- No navigation errors

---

### Step 8: Optimize Performance
**Goal**: Ensure smooth performance

**Tasks**:
1. Implement virtual scrolling for long result lists
2. Add search result caching
3. Optimize re-renders with React.memo
4. Lazy load the search index
5. Add loading states

**Performance Targets**:
- Search input has <50ms latency
- Initial load <200ms
- Smooth 60fps animations

---

### Step 9: Add Advanced Features
**Goal**: Enhance user experience

**Tasks**:
1. Add recent searches history
2. Implement search shortcuts (e.g., "s:" for stories only)
3. Add breadcrumb navigation in results
4. Support for deep linking to search queries
5. Add "No results" state with suggestions

**Acceptance Criteria**:
- Recent searches persist per session
- Filter shortcuts work correctly
- User-friendly empty states

---

### Step 10: Testing & Documentation
**Goal**: Ensure reliability and maintainability

**Tasks**:
1. Write unit tests for:
    - Search index builder
    - Search algorithm
    - Keyboard shortcuts
2. Add integration tests for full flow
3. Create Storybook story for SearchDialog
4. Write usage documentation
5. Add accessibility tests

**Test Coverage Targets**:
- >80% code coverage
- All user flows tested
- Accessibility compliance (WCAG 2.1 AA)

---

## API Design

### SearchDialog Props
```typescript
interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (result: SearchResult) => void
  placeholder?: string
  maxResults?: number
}
```

### Search Result Interface
```typescript
interface SearchResult {
  id: string
  title: string
  type: 'story' | 'docs'
  path: string
  tags?: string[]
  headings?: string[]
  matches?: MatchInfo[]
}
```

## Success Metrics
- Search dialog opens in <100ms
- Relevant results appear within top 3 positions
- 90% of searches complete in <200ms
- Zero accessibility violations
- Works across all supported browsers
