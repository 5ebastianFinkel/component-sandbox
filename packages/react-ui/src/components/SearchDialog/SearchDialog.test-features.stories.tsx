import type { Meta, StoryObj } from '@storybook/react';
import { SearchDialog } from './SearchDialog';
import { SearchDialogProvider } from './SearchDialogProvider';
import { SearchEngine } from '@/utils/searchUtils.ts';
import { SearchResult } from '@/utils/searchIndexBuilder.ts';

const meta: Meta<typeof SearchDialog> = {
  title: 'Components/SearchDialog/Feature Tests',
  component: SearchDialog,
  decorators: [
    (Story) => (
      <SearchDialogProvider>
        <Story />
      </SearchDialogProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof SearchDialog>;

// Create test data with various attributes for comprehensive testing
const testData: SearchResult[] = [
  // Stories with various attributes
  {
    id: 'story-button-primary',
    title: 'Button - Primary',
    path: '/story/components-button--primary',
    type: 'story',
    componentName: 'Button',
    tags: ['autodocs', 'ui', 'interactive'],
    description: 'Primary button component for main actions',
    headings: [],
  },
  {
    id: 'story-button-secondary',
    title: 'Button - Secondary',
    path: '/story/components-button--secondary',
    type: 'story',
    componentName: 'Button',
    tags: ['ui', 'interactive'],
    description: 'Secondary button for less prominent actions',
    headings: [],
  },
  {
    id: 'story-input-text',
    title: 'Input - Text Field',
    path: '/story/components-input--text',
    type: 'story',
    componentName: 'Input',
    tags: ['form', 'interactive', 'new'],
    description: 'Text input field for user data entry',
    headings: [],
  },
  {
    id: 'story-card-basic',
    title: 'Card - Basic Layout',
    path: '/story/components-card--basic',
    type: 'story',
    componentName: 'Card',
    tags: ['layout', 'container'],
    description: 'Basic card component for content grouping',
    headings: [],
  },
  {
    id: 'story-modal-dialog',
    title: 'Modal - Dialog Window',
    path: '/story/components-modal--dialog',
    type: 'story',
    componentName: 'Modal',
    tags: ['overlay', 'interactive', 'accessibility'],
    description: 'Modal dialog for important user interactions',
    headings: [],
  },
  // Documentation with headings
  {
    id: 'docs-getting-started',
    title: 'Getting Started Guide',
    path: '/docs/getting-started',
    type: 'docs',
    componentName: '',
    tags: ['documentation', 'guide', 'new'],
    description: 'Learn how to use our component library',
    headings: ['Installation', 'Basic Usage', 'Configuration', 'Examples'],
  },
  {
    id: 'docs-design-system',
    title: 'Design System Overview',
    path: '/docs/design-system',
    type: 'docs',
    componentName: '',
    tags: ['design', 'guidelines', 'best-practices'],
    description: 'Complete design system documentation',
    headings: ['Color Palette', 'Typography', 'Spacing', 'Components', 'Accessibility'],
  },
  {
    id: 'docs-api-reference',
    title: 'API Reference',
    path: '/docs/api-reference',
    type: 'docs',
    componentName: '',
    tags: ['api', 'reference', 'technical'],
    description: 'Detailed API documentation for all components',
    headings: ['Props', 'Methods', 'Events', 'Types', 'Examples'],
  },
  {
    id: 'docs-accessibility',
    title: 'Accessibility Guidelines',
    path: '/docs/accessibility',
    type: 'docs',
    componentName: '',
    tags: ['accessibility', 'a11y', 'wcag'],
    description: 'How to build accessible components',
    headings: ['WCAG Compliance', 'Screen Readers', 'Keyboard Navigation', 'Color Contrast'],
  },
  {
    id: 'docs-theming',
    title: 'Theming and Customization',
    path: '/docs/theming',
    type: 'docs',
    componentName: '',
    tags: ['theming', 'customization', 'styling'],
    description: 'Learn how to customize component appearance',
    headings: ['CSS Variables', 'Theme Provider', 'Dark Mode', 'Custom Themes'],
  },
];

// Create search engine instance
const searchEngine = new SearchEngine();

// Initialize search engine with test data
const initializeTestData = () => {
  searchEngine.clear();
  searchEngine.buildIndex(testData);
};

export const BasicSearch: Story = {
  render: () => {
    initializeTestData();
    return (
      <div>
        <h2>Basic Search Test</h2>
        <p>Test basic search functionality:</p>
        <ul>
          <li>Search "button" - should find Button components</li>
          <li>Search "modal" - should find Modal component</li>
          <li>Search "accessibility" - should find related docs and components</li>
          <li>Search "design" - should find design system documentation</li>
        </ul>
        <SearchDialog open={true} onOpenChange={() => {}} />
      </div>
    );
  },
};

export const SearchShortcuts: Story = {
  render: () => {
    initializeTestData();
    return (
      <div>
        <h2>Search Shortcuts Test</h2>
        <p>Test all search shortcuts:</p>
        <ul>
          <li><code>s: button</code> - search only in stories for "button"</li>
          <li><code>d: api</code> - search only in documentation for "api"</li>
          <li><code>c: modal</code> - search by component name for "modal"</li>
          <li><code>t: accessibility</code> - search by tags for "accessibility"</li>
          <li><code>h: typography</code> - search headings for "typography"</li>
          <li><code>new: guide</code> - search recently added content</li>
        </ul>
        <SearchDialog open={true} onOpenChange={() => {}} />
      </div>
    );
  },
};

export const TagsAndCategories: Story = {
  render: () => {
    initializeTestData();
    return (
      <div>
        <h2>Tags and Categories Search</h2>
        <p>Test searching by tags:</p>
        <ul>
          <li>Search "autodocs" - should find components with autodocs tag</li>
          <li>Search "interactive" - should find interactive components</li>
          <li>Search "form" - should find form-related components</li>
          <li>Search "wcag" - should find accessibility documentation</li>
        </ul>
        <SearchDialog open={true} onOpenChange={() => {}} />
      </div>
    );
  },
};

export const GroupedResults: Story = {
  render: () => {
    initializeTestData();
    return (
      <div>
        <h2>Grouped Results Test</h2>
        <p>Search for terms that return both stories and documentation:</p>
        <ul>
          <li>Search "component" - should show results grouped by Stories and Documentation</li>
          <li>Search "guide" - should show documentation results</li>
          <li>Search "button" - should show story results</li>
        </ul>
        <SearchDialog open={true} onOpenChange={() => {}} />
      </div>
    );
  },
};

export const HeadingSearch: Story = {
  render: () => {
    initializeTestData();
    return (
      <div>
        <h2>Heading Search Test</h2>
        <p>Test searching within documentation headings:</p>
        <ul>
          <li>Search "installation" - should find docs with Installation heading</li>
          <li>Search "typography" - should find Design System doc with Typography heading</li>
          <li>Search "h: wcag" - should boost heading matches for WCAG</li>
          <li>Search "h: dark mode" - should find theming docs</li>
        </ul>
        <SearchDialog open={true} onOpenChange={() => {}} />
      </div>
    );
  },
};

export const EmptyResults: Story = {
  render: () => {
    initializeTestData();
    return (
      <div>
        <h2>Empty Results Test</h2>
        <p>Test search with no results:</p>
        <ul>
          <li>Search "nonexistentcomponent" - should show "No results found"</li>
          <li>Search "xyz123" - should show empty state</li>
          <li>Test that clearing search shows recent searches again</li>
        </ul>
        <SearchDialog open={true} onOpenChange={() => {}} />
      </div>
    );
  },
};

export const KeyboardNavigation: Story = {
  render: () => {
    initializeTestData();
    return (
      <div>
        <h2>Keyboard Navigation Test</h2>
        <p>Test keyboard controls:</p>
        <ul>
          <li>Arrow keys - navigate up/down through results</li>
          <li>Enter - select highlighted result</li>
          <li>ESC - close dialog</li>
          <li>Cmd/Ctrl+K - toggle dialog (when integrated)</li>
        </ul>
        <SearchDialog open={true} onOpenChange={() => {}} />
      </div>
    );
  },
};

export const SearchHistory: Story = {
  render: () => {
    initializeTestData();
    // Pre-populate some search history
    const searches = ['button', 'modal', 'accessibility', 'design system'];
    searches.forEach(term => {
      localStorage.setItem(`search_history_${term}`, JSON.stringify({
        term,
        count: Math.floor(Math.random() * 10) + 1,
        lastUsed: new Date().toISOString()
      }));
    });
    
    return (
      <div>
        <h2>Search History Test</h2>
        <p>The dialog should show recent searches when opened:</p>
        <ul>
          <li>Recent searches should be visible when dialog opens</li>
          <li>Clicking a recent search should perform that search</li>
          <li>New searches should be added to history</li>
          <li>Frequently used searches should appear higher</li>
        </ul>
        <SearchDialog open={true} onOpenChange={() => {}} />
      </div>
    );
  },
};