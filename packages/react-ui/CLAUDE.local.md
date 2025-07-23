# CLAUDE.local.md

Local development notes and context for Claude Code when working with this package.

## Recent Work Completed

### Test Infrastructure Overhaul (2025-01)
- **Fixed all failing tests**: SearchDialog (17), SearchHistory (19), SearchUtils (14)
- **Established E2E testing**: 42 Playwright tests across 3 browsers
- **Separated test types**: Clear distinction between unit tests (Vitest) and E2E tests (Playwright)
- **Enhanced Storybook integration**: Fixed Node.js polyfills and story rendering issues

### Key Components Status

#### SearchDialog Component ✅
- **Location**: `src/components/SearchDialog/`
- **Tests**: 17 tests passing with proper React act() wrapping
- **Storybook**: Stories render correctly with polyfills
- **Features**: Real-time search, keyboard shortcuts, accessibility compliant

#### Search Utilities ✅
- **SearchHistory**: Frequency tracking fixed, localStorage persistence working
- **SearchEngine**: Improved scoring algorithm for exact vs partial matches
- **SearchCache**: LRU caching implementation for performance

## Current Architecture

### Testing Strategy
```
├── Unit Tests (Vitest)
│   ├── src/**/*.test.{ts,tsx}
│   ├── Environment: happy-dom
│   └── Coverage: Component logic, utilities, hooks
│
└── E2E Tests (Playwright)
    ├── playwright/*.spec.ts
    ├── Browsers: Chromium, Firefox, WebKit  
    └── Coverage: User workflows, integration
```

### Build Process
- **Development**: `npm run dev` (Vite dev server)
- **Build**: `npm run build` (builds search index + TypeScript + Vite)
- **Storybook**: `npm run storybook` (port 6007)

## Common Development Tasks

### Running Tests
```bash
# Unit tests only
npm run test:unit

# E2E tests only  
npm run test:e2e

# All tests with coverage
npm run test:coverage
```

### SearchDialog Development
1. **Component files**: `src/components/SearchDialog/`
2. **Test files**: Same directory with `.test.tsx` extension
3. **Stories**: `SearchDialog.stories.tsx` for Storybook demos
4. **Styling**: BEM CSS modules (`.module.css`)

### Adding New Tests
- **Unit tests**: Place in same directory as component
- **E2E tests**: Add to `playwright/` directory
- **Mock patterns**: See existing test files for FlexSearch, localStorage mocking

## Known Issues & Workarounds

### Storybook + Node.js Libraries
- **Issue**: SearchDialog uses `@babel/parser` which expects Node.js globals
- **Solution**: `preview-head.html` provides browser polyfills
- **Location**: `.storybook/preview-head.html`

### FlexSearch Mocking
- **Pattern**: Use named export mock: `{ Index: vi.fn().mockImplementation(...) }`
- **Not**: Default export pattern which breaks with current imports

### Playwright API Updates
- **Old**: `getByPlaceholderText()`, `type()`
- **New**: `getByPlaceholder()`, `pressSequentially()`
- **Why**: Newer APIs are more reliable and non-deprecated

## File Structure Notes

### Test Configuration
- **Vitest**: `vitest.config.ts` (unit tests, excludes playwright/)
- **Playwright**: `playwright.config.ts` (E2E tests, starts Storybook)
- **Test Setup**: `src/test/setup.ts` (global test configuration)

### Search Implementation
- **Core**: `src/utils/searchUtils.ts` (SearchEngine class)
- **History**: `src/utils/searchHistory.ts` (persistence, frequency tracking)
- **Integration**: `src/utils/storybookDataExtractor.ts` (data source)

## Performance Considerations

### Search Index
- **Build time**: Index generated during build process
- **Runtime**: Cached in memory, LRU eviction policy
- **Size**: Monitor bundle impact of search utilities

### Test Performance
- **Unit tests**: Fast (<1s), isolated component testing
- **E2E tests**: Slower (~30s), but comprehensive integration coverage
- **Parallel execution**: Both test types support parallel runs

## Next Development Areas

### Potential Improvements
1. **Search Analytics**: Track search patterns and result effectiveness
2. **Fuzzy Matching**: Enhanced search with typo tolerance
3. **Search Filters**: More granular filtering options
4. **Mobile Optimization**: Touch-friendly interactions

### Test Coverage Gaps
1. **Visual Regression**: Consider adding visual testing
2. **Performance Testing**: Search response time validation
3. **Accessibility Testing**: Automated a11y checks in CI

## Debugging Tips

### Test Failures
1. **Check mocks**: Ensure FlexSearch mock uses named export
2. **React warnings**: Wrap state changes in `act()`
3. **Async issues**: Use `waitFor()` for async operations

### Storybook Issues
1. **Process undefined**: Check `preview-head.html` polyfills
2. **Stories not found**: Verify paths in `.storybook/main.ts`
3. **Import errors**: Check Node.js compatibility

## Dependencies to Watch

### Critical Dependencies
- **FlexSearch**: Search engine (ensure mock compatibility)
- **cmdk**: Command palette UI (API stability)
- **@playwright/test**: E2E testing (API updates)

### Development Dependencies
- **Vitest**: Unit testing framework
- **@testing-library/react**: Component testing utilities
- **Storybook**: Component documentation and demos