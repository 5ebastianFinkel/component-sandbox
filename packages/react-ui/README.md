# React UI Component Library

A modern React component library with TypeScript support, built for design systems and rapid development.

## Components

### Search Dialog

A powerful search dialog for Storybook that enables users to quickly find stories and documentation.

**Features:**
- 🔍 Fast search powered by FlexSearch
- ⌨️ Global keyboard shortcut (CMD/CTRL+K)
- 📚 Searches both stories and documentation
- 🏷️ Advanced search shortcuts (s:, d:, c:, t:, h:)
- 📖 Persistent search history
- ♿ Full accessibility support
- 📱 Responsive design
- 🌙 Dark mode support

**Usage:**
```tsx
import { SearchDialogProvider } from '@component-sandbox/react-ui';

function App() {
  return (
    <SearchDialogProvider>
      <YourApp />
    </SearchDialogProvider>
  );
}
```

### Mermaid Diagram

A React component for rendering Mermaid diagrams with full TypeScript support.

**Usage:**
```tsx
import { MermaidDiagram } from '@component-sandbox/react-ui';

<MermaidDiagram 
  chart="graph TD; A-->B; B-->C;" 
  ariaLabel="Simple flow diagram"
/>
```

## Development

```bash
# Start development server
npm run dev

# Start Storybook
npm run storybook

# Run tests
npm run test

# Build library
npm run build
```

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build the library for production
- `npm run storybook` - Start Storybook development server
- `npm run test` - Run unit tests with Vitest
- `npm run test:e2e` - Run end-to-end tests with Playwright

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT