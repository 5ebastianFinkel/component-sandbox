# @component-sandbox/react-ui

A modern React component library built with TypeScript, featuring a powerful SearchDialog component with real-time search capabilities, keyboard shortcuts, and comprehensive accessibility support.

## Features

### 🔍 SearchDialog Component
- **Real-time search** with debounced input and instant results
- **Global keyboard shortcuts** (Cmd/Ctrl+K) for quick access
- **Intelligent ranking** with exact match prioritization
- **Search history** with frequency-based suggestions
- **Keyboard navigation** with arrow keys and Enter selection
- **Accessibility compliant** with proper ARIA attributes and focus management
- **Mobile responsive** with touch-friendly interactions

### 🎨 Design System
- **BEM CSS methodology** for consistent, maintainable styles
- **CSS Custom Properties** for theming and customization
- **Compound component patterns** for flexible composition
- **Scoped styling** to prevent conflicts

### 🛠️ Developer Experience
- **TypeScript first** with comprehensive type definitions
- **Storybook integration** for component documentation and testing
- **Comprehensive testing** with unit tests (Vitest) and E2E tests (Playwright)
- **Performance optimized** with search caching and virtualization

## Installation

```bash
npm install @component-sandbox/react-ui
```

## Quick Start

### Basic SearchDialog Usage

```tsx
import { SearchDialog } from '@component-sandbox/react-ui';
import { useState } from 'react';

function App() {
  const [open, setOpen] = useState(false);

  const handleSelect = (result) => {
    console.log('Selected:', result);
    setOpen(false);
  };

  return (
    <div>
      <button onClick={() => setOpen(true)}>
        Open Search
      </button>
      
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
        placeholder="Search components..."
      />
    </div>
  );
}
```

### Global Search Provider

For global keyboard shortcuts and enhanced functionality:

```tsx
import { SearchDialogProvider } from '@component-sandbox/react-ui';

function App() {
  const handleNavigate = (result) => {
    // Handle navigation to search result
    window.location.href = result.path;
  };

  return (
    <SearchDialogProvider onNavigate={handleNavigate}>
      <YourApp />
    </SearchDialogProvider>
  );
}
```

### Design Token Components

```tsx
import { 
  TokenDisplay, 
  TokenGrid, 
  TokenTable, 
  CopyableToken 
} from '@component-sandbox/react-ui';

// Comprehensive token display with search and filtering
<TokenDisplay />

// Grid layout for specific token category
<TokenGrid category="color" visualType="color" />

// Table format with detailed information
<TokenTable category="spacing" showPreview={true} />

// Individual copyable token
<CopyableToken token="--color-brand-primary" />
```

### Mermaid Diagram Component

```tsx
import { MermaidDiagram } from '@component-sandbox/react-ui';

<MermaidDiagram 
  chart="graph TD; A-->B; B-->C;" 
  ariaLabel="Simple flow diagram"
/>
```

## API Reference

### SearchDialog Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | `false` | Controls dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | - | Called when dialog open state changes |
| `onSelect` | `(result: SearchResult) => void` | - | Called when a search result is selected |
| `placeholder` | `string` | `"Search stories and docs..."` | Input placeholder text |
| `maxResults` | `number` | `50` | Maximum number of search results |
| `virtualizationThreshold` | `number` | `20` | When to enable result virtualization |

### SearchDialogProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onNavigate` | `(result: SearchResult) => void` | - | Custom navigation handler |
| `onError` | `(error: Error, result: SearchResult) => void` | - | Error handler for navigation failures |
| `children` | `ReactNode` | - | App content wrapped by provider |

### SearchResult Interface

```typescript
interface SearchResult {
  id: string;
  title: string;
  type: 'story' | 'docs';
  path: string;
  tags?: string[];
  componentName?: string;
  description?: string;
  headings?: string[];
}
```

### TokenDisplay Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| No props required | - | - | Displays all tokens with search and filtering |

### TokenGrid Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `category` | `TokenCategory` | - | Filter tokens by category (color, border, layer, font, spacing, shadow) |
| `filter` | `string` | - | Custom filter string (pipe-separated values) |
| `showValue` | `boolean` | `true` | Whether to show token values |
| `visualType` | `VisualType` | `'color'` | Visual representation type (color, radius, shadow, text, spacing) |

### TokenTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `category` | `TokenCategory` | - | Filter tokens by category |
| `filter` | `string` | - | Custom filter string (pipe-separated values) |
| `showPreview` | `boolean` | `true` | Whether to show visual preview column |
| `showNumericValue` | `boolean` | `false` | Whether to show numeric values instead of CSS values |

### CopyableToken Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `token` | `string` | - | The token name to display and copy |
| `showVar` | `boolean` | `true` | Whether to wrap the token in var() syntax |

### MermaidDiagram Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chart` | `string` | - | The Mermaid diagram definition |
| `className` | `string` | - | Optional CSS class name |
| `config` | `Record<string, any>` | - | Optional Mermaid configuration |
| `ariaLabel` | `string` | - | Optional aria-label for accessibility |
| `scale` | `number` | `1` | Optional scale factor for the diagram |

## Search Features

### Search Shortcuts

The SearchDialog supports powerful search shortcuts:

- `s:query` - Search stories only
- `d:query` - Search documentation only
- `c:ComponentName` - Search by component name
- `t:tagname` - Search by tag
- `h:heading` - Search documentation headings
- `new:` - Show recently added content

### Search Capabilities

- **Fuzzy matching** for typo tolerance
- **Exact match prioritization** for precise results
- **Multi-field search** across titles, descriptions, tags, and content
- **Result grouping** by type (Stories vs Documentation)
- **Frequency-based ranking** for popular results
- **Search history persistence** with localStorage

## Design Token System

The library includes a comprehensive design token system with multiple display components for showcasing design tokens in documentation and developer tools.

### Token Categories

- **Color Tokens**: Brand colors, semantic colors, surface colors
- **Spacing Tokens**: Margins, paddings, gaps with consistent scale  
- **Border Tokens**: Border radius, border widths
- **Typography Tokens**: Font sizes, line heights, font weights
- **Shadow Tokens**: Box shadows for elevation and depth
- **Layer Tokens**: Z-index values for stacking order

### Token Display Options

#### TokenDisplay Component
- **Comprehensive view** with all tokens
- **Real-time search** across token names and values
- **Category filtering** with dropdown selection
- **Visual previews** for all token types
- **Copy-to-clipboard** functionality

#### TokenGrid Component  
- **Grid layout** optimized for visual browsing
- **Category filtering** for focused exploration
- **Multiple visual types** (color swatches, radius previews, shadows)
- **Responsive design** with flexible columns

#### TokenTable Component
- **Structured table format** for detailed information
- **Sortable columns** with token names, values, descriptions
- **Optional preview column** with visual representations
- **Numeric value display** for layer and spacing tokens

#### CopyableToken Component
- **Inline token display** for documentation
- **Click-to-copy** with visual feedback
- **var() syntax** wrapping option
- **Tooltip guidance** for user interaction

### Token Usage Examples

```tsx
// Filter color tokens in grid layout
<TokenGrid 
  category="color" 
  visualType="color" 
  showValue={true} 
/>

// Show spacing tokens in table with numeric values
<TokenTable 
  category="spacing" 
  showNumericValue={true} 
  showPreview={false} 
/>

// Custom filter for brand-related tokens
<TokenGrid 
  filter="brand|primary|secondary" 
  visualType="color" 
/>

// Comprehensive token browser with search
<TokenDisplay />
```

## Styling

### CSS Custom Properties

The component uses CSS custom properties for theming:

```css
:root {
  --search-overlay-bg: rgba(0, 0, 0, 0.5);
  --search-dialog-bg: white;
  --search-dialog-border: #e1e5ea;
  --search-input-bg: #f6f8fa;
  --search-result-hover: #f6f8fa;
  --search-text-primary: #24292f;
  --search-text-secondary: #656d76;
}
```

### Dark Mode Support

```css
[data-theme="dark"] {
  --search-dialog-bg: #21262d;
  --search-dialog-border: #30363d;
  --search-input-bg: #21262d;
  --search-result-hover: #30363d;
  --search-text-primary: #f0f6fc;
  --search-text-secondary: #8b949e;
}
```

## Development

### Scripts

```bash
# Development
npm run dev              # Start Vite dev server
npm run storybook        # Start Storybook on port 6007

# Building
npm run build            # Build for production
npm run build-storybook  # Build Storybook

# Testing
npm run test:unit        # Run unit tests with Vitest
npm run test:e2e         # Run E2E tests with Playwright
npm run test:coverage    # Run tests with coverage report
```

### Project Structure

```
src/
├── components/
│   ├── SearchDialog/           # Main SearchDialog component
│   │   ├── SearchDialog.tsx    # Core component
│   │   ├── SearchDialog.test.tsx
│   │   ├── SearchDialog.stories.tsx
│   │   ├── SearchDialogProvider.tsx
│   │   ├── SearchResultItem.tsx
│   │   ├── VirtualizedList.tsx
│   │   └── RecentSearches.tsx
│   ├── TokenDisplay/           # Comprehensive token browser
│   │   ├── TokenDisplay.tsx
│   │   └── TokenDisplay.module.css
│   ├── TokenGrid/              # Grid layout for tokens
│   │   ├── TokenGrid.tsx
│   │   └── TokenGrid.module.css
│   ├── TokenTable/             # Table format for tokens
│   │   ├── TokenTable.tsx
│   │   └── TokenTable.module.css
│   ├── CopyableToken/          # Individual copyable token
│   │   ├── CopyableToken.tsx
│   │   └── CopyableToken.module.css
│   ├── MermaidDiagram/         # Mermaid diagram component
│   │   ├── MermaidDiagram.tsx
│   │   ├── MermaidDiagram.utils.ts
│   │   └── MermaidDiagram.stories.tsx
│   ├── ToastProvider/          # Toast notification system
│   │   ├── ToastProvider.tsx
│   │   └── ToastProvider.module.css
│   └── shared/                 # Shared utilities for tokens
│       ├── types.ts            # TypeScript definitions
│       ├── constants.ts        # Token constants
│       ├── hooks.ts            # Shared hooks
│       └── utils.ts            # Utility functions
├── utils/
│   ├── searchUtils.ts          # Search engine implementation
│   ├── searchHistory.ts        # Search history management
│   ├── searchIndexBuilder.ts   # Index building utilities
│   └── storybookDataExtractor.ts
├── hooks/
│   ├── useKeyboardShortcut.ts
│   └── usePerformanceOptimization.ts
└── styles/
    └── tokens.css              # Design system tokens
```

### Testing

The project uses a comprehensive testing strategy:

#### Unit Tests (Vitest)
- **Component testing** with React Testing Library
- **Utility function testing** with mocked dependencies
- **Hook testing** for custom React hooks
- **Fast execution** with happy-dom environment

#### E2E Tests (Playwright)
- **Cross-browser testing** (Chromium, Firefox, WebKit)
- **User workflow validation** with real interactions
- **Accessibility testing** with screen reader simulation
- **Visual regression** capabilities

#### Running Tests

```bash
# Unit tests only
npm run test:unit

# E2E tests only (starts Storybook automatically)
npm run test:e2e

# Coverage report
npm run test:coverage
```

## Browser Support

- **Modern browsers** with ES2015+ support
- **Chrome/Chromium** 60+
- **Firefox** 60+
- **Safari** 12+
- **Edge** 79+

## Performance

### Optimizations

- **Search index caching** with LRU eviction
- **Debounced search input** (150ms default)
- **Result virtualization** for large result sets
- **Lazy loading** of search data
- **Memory-efficient** string matching

### Bundle Size

- **Core component**: ~15KB gzipped
- **Search utilities**: ~8KB gzipped
- **Peer dependencies**: React 18+

## Accessibility

The SearchDialog component follows WCAG 2.1 AA guidelines:

- **Keyboard navigation** with Tab, Arrow keys, Enter, and Escape
- **Screen reader support** with proper ARIA labels and roles
- **Focus management** with focus trapping and restoration
- **High contrast** support with CSS custom properties
- **Reduced motion** support for animations

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development: `npm run storybook`
4. Run tests: `npm run test:unit`

### Code Style

- **TypeScript** for all new code
- **BEM CSS** naming convention
- **Composition API** for Vue-style React components
- **Test-driven development** with comprehensive coverage

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request with detailed description

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Changelog

### Latest Changes

#### v1.0.0 (2025-01)
- 🎉 Initial release with comprehensive component library
- 🔍 **SearchDialog**: Advanced search with keyboard shortcuts and real-time results
- 🎨 **Design Token System**: Complete token display components (TokenDisplay, TokenGrid, TokenTable, CopyableToken)
- 📊 **MermaidDiagram**: Full-featured diagram rendering with accessibility support
- 🔔 **ToastProvider**: Notification system for user feedback
- ✅ Comprehensive test suite (50+ unit tests, 42 E2E tests)
- 🎨 Complete Storybook documentation
- 🔧 TypeScript support with full type definitions
- ♿ WCAG 2.1 AA accessibility compliance
- 🚀 Performance optimizations and caching
- 📱 Mobile-responsive design

## Support

- **Documentation**: [Storybook](http://localhost:6007) (when running locally)
- **Issues**: [GitHub Issues](https://github.com/5ebastianFinkel/component-sandbox/issues)
- **Discussions**: [GitHub Discussions](https://github.com/5ebastianFinkel/component-sandbox/discussions)

---

Built with ❤️ using React, TypeScript, and modern web technologies.