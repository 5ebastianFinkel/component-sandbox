# Component Sandbox

A modern monorepo containing two comprehensive component libraries built with different frameworks, showcasing advanced patterns and best practices for modern web development.

## 📦 Packages

### [@component-sandbox/react-ui](./packages/react-ui)
A feature-rich React component library built with TypeScript, featuring advanced search capabilities and a comprehensive design token system.

**Key Features:**
- 🔍 **SearchDialog** - Advanced search with real-time results, keyboard shortcuts (Cmd/Ctrl+K), and intelligent ranking
- 🎨 **Design Token System** - Complete token display components (TokenDisplay, TokenGrid, TokenTable, CopyableToken)
- 📊 **MermaidDiagram** - Full-featured diagram rendering with accessibility support
- 🔔 **ToastProvider** - Notification system for user feedback
- ♿ **WCAG 2.1 AA** accessibility compliance
- 📱 **Mobile responsive** design with touch-friendly interactions

**Tech Stack:** React 18, TypeScript, Vite, Storybook, Vitest, Playwright

### [@component-sandbox/vue-ui](./packages/vue-ui)
A Vue 3 component library utilizing the Composition API and compound component patterns for maximum flexibility and maintainability.

**Key Features:**
- 📋 **SpDropdown** - Compound dropdown component system with sub-menu support
- 🔧 **Composition API** - Modern Vue 3 patterns with TypeScript
- 🎯 **Compound Components** - Flexible component composition using provide/inject
- 🎨 **BEM + SCSS** - Consistent styling methodology with design tokens
- 🔍 **Context-based State** - Centralized state management via composables

**Tech Stack:** Vue 3, TypeScript, Vite, Storybook, VueUse, Vue Test Utils

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Git for version control

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd component-sandbox

# Install all dependencies for both packages
npm run install:all
```

### Development Commands

#### React UI Development
```bash
# Start React development server
npm run dev:react

# Start React Storybook (port 6007)
npm run storybook:react

# Run React unit tests
npm run test:unit -w @component-sandbox/react-ui

# Run React E2E tests
npm run test:e2e -w @component-sandbox/react-ui
```

#### Vue UI Development
```bash
# Start Vue development server  
npm run dev:vue

# Start Vue Storybook (port 6006)
npm run storybook:vue

# Build Vue library
npm run build:vue
```

#### Universal Commands
```bash
# Build both packages
npm run build:all

# Start either Storybook (React on 6007, Vue on 6006)
npm run storybook:react    # or
npm run storybook:vue
```

## 🏗️ Architecture

### Monorepo Structure
```
component-sandbox/
├── packages/
│   ├── react-ui/              # React component library
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── utils/         # Search utilities
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   └── styles/        # Design tokens
│   │   ├── .storybook/        # Storybook configuration
│   │   ├── playwright/        # E2E tests
│   │   └── README.md          # Package documentation
│   └── vue-ui/                # Vue component library
│       ├── src/
│       │   ├── components/    # Vue components
│       │   │   └── dropdown/  # Compound dropdown system
│       │   └── styles/        # SCSS styles and tokens
│       ├── .storybook/        # Storybook configuration
│       └── package.json
├── .gitignore
├── package.json               # Workspace configuration
└── README.md                  # This file
```

### Design Principles

Both packages follow consistent architectural principles:

**React UI Patterns:**
- Compound components with context providers
- Custom hooks for state management
- TypeScript-first development
- Performance optimization with virtualization
- Comprehensive testing (50+ unit tests, 42 E2E tests)

**Vue UI Patterns:**
- Compound components using provide/inject
- Composables for reusable logic
- BEM naming with SCSS modules
- Scoped styling to prevent conflicts
- German user documentation with English developer docs

## 🧪 Testing Strategy

### React UI Testing
- **Unit Tests**: Vitest with React Testing Library (50+ tests)
- **E2E Tests**: Playwright across 3 browsers (42 tests total)
- **Coverage**: Comprehensive coverage with v8 reporting
- **Separation**: Clear separation between unit and E2E test suites

### Vue UI Testing
- **Unit Tests**: Vue Test Utils with Vitest
- **Component Tests**: Testing Library Vue integration
- **Type Checking**: Vue TSC for TypeScript validation

### Running Tests
```bash
# React unit tests only
npm run test:unit -w @component-sandbox/react-ui

# React E2E tests only  
npm run test:e2e -w @component-sandbox/react-ui

# Vue tests
npm run test -w @component-sandbox/vue-ui
```

## 📚 Documentation

### Storybook Documentation
- **React Storybook**: `npm run storybook:react` → http://localhost:6007
- **Vue Storybook**: `npm run storybook:vue` → http://localhost:6006

Each package includes comprehensive Storybook documentation with:
- Interactive component demos
- API documentation with props tables
- Usage examples and code snippets
- Accessibility testing integration
- Visual regression testing capabilities

### Package READMEs
- [React UI Documentation](./packages/react-ui/README.md) - Comprehensive API reference
- [Vue UI Documentation](./packages/vue-ui/) - Component architecture guide

## 🔧 Development Tools

### Shared Dependencies
- **TypeScript 5.8+** - Type safety across both packages
- **Vite 7.0+** - Fast build tooling and HMR
- **Storybook 9.0+** - Component documentation and testing
- **Vitest 3.2+** - Unit testing framework
- **Sass 1.89+** - Advanced CSS preprocessing

### Package-Specific Tools
**React UI:**
- React Testing Library, Playwright, FlexSearch, @babel/parser

**Vue UI:**
- Vue Test Utils, VueUse, @vue/tsconfig

## 🚀 Production Build

### Building Individual Packages
```bash
# Build React UI only
npm run build:react

# Build Vue UI only  
npm run build:vue

# Build both packages
npm run build:all
```

### Build Outputs
- **React UI**: `packages/react-ui/dist/` - ESM modules with TypeScript declarations
- **Vue UI**: `packages/vue-ui/dist/` - ESM modules with style exports

## 🤝 Contributing

### Development Workflow
1. **Setup**: `npm run install:all`
2. **Development**: Choose package and run appropriate dev command
3. **Testing**: Run relevant test suites before committing
4. **Documentation**: Update Storybook stories for new components
5. **PR**: Submit with comprehensive description and test coverage

### Code Standards
- **TypeScript** required for all new code
- **ESLint + Prettier** for consistent formatting  
- **Conventional Commits** for clear history
- **Test coverage** required for new features
- **Accessibility** testing for all interactive components

### Architecture Decisions
- **Monorepo**: npm workspaces for simplified dependency management
- **Framework Separation**: Clear boundaries between React and Vue implementations
- **Shared Tooling**: Consistent build and development tools across packages
- **Component Patterns**: Compound components for complex UI in both frameworks

## 📄 License

MIT License - see individual package LICENSE files for details.

## 🏆 Achievements

This monorepo demonstrates:
- **92 Total Tests** across both packages with comprehensive coverage
- **Cross-framework Expertise** with modern React and Vue patterns
- **Advanced Component Patterns** including compound components and context providers
- **Performance Optimization** with search caching, virtualization, and lazy loading
- **Accessibility Compliance** with WCAG 2.1 AA standards
- **Developer Experience** with TypeScript, Storybook, and comprehensive testing
- **Modern Tooling** with Vite, ESM modules, and optimized build processes

---

**Built with ❤️ using modern web technologies and best practices**

For package-specific documentation and API references, see the individual package READMEs.