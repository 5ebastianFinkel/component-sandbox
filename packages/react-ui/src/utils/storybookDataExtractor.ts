import { SearchIndexBuilder, SearchResult } from './searchIndexBuilder';

export class StorybookDataExtractor {
  private indexBuilder: SearchIndexBuilder;

  constructor() {
    this.indexBuilder = new SearchIndexBuilder();
  }

  async extractAllData(): Promise<SearchResult[]> {
    // In a real implementation, this would scan the file system
    // or integrate with Storybook's APIs to get dynamic data
    
    // For now, we'll create static data based on what we know exists
    const stories = await this.extractStoryData();
    const docs = await this.extractDocsData();
    
    this.indexBuilder.clear();
    
    // Add stories
    stories.forEach(story => {
      this.indexBuilder.addStory(
        story.id,
        story.title,
        story.path,
        story.tags,
        story.description,
        story.componentName
      );
    });

    // Add docs
    docs.forEach(doc => {
      this.indexBuilder.addDocs(
        doc.id,
        doc.title,
        doc.path,
        doc.headings || [],
        doc.tags,
        doc.description
      );
    });

    return this.indexBuilder.getSearchData();
  }

  private async extractStoryData(): Promise<SearchResult[]> {
    // Static data based on current stories
    // In production, this would scan actual files
    return [
      // MermaidDiagram stories
      {
        id: 'mermaid-diagram-main',
        title: 'Components/MermaidDiagram',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--flowchart',
        tags: ['autodocs', 'component', 'diagram', 'visualization'],
        description: 'A React component for rendering Mermaid diagrams with full support for all diagram types.',
        componentName: 'MermaidDiagram'
      },
      {
        id: 'mermaid-diagram-flowchart',
        title: 'Components/MermaidDiagram - Flowchart',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--flowchart',
        tags: ['autodocs', 'flowchart', 'diagram'],
        description: 'Flowchart diagram example showing software development workflow',
        componentName: 'MermaidDiagram'
      },
      {
        id: 'mermaid-diagram-sequence',
        title: 'Components/MermaidDiagram - Sequence Diagram',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--sequencediagram',
        tags: ['autodocs', 'sequence', 'diagram'],
        description: 'Sequence diagram example showing web application request flow',
        componentName: 'MermaidDiagram'
      },
      {
        id: 'mermaid-diagram-class',
        title: 'Components/MermaidDiagram - Class Diagram',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--classdiagram',
        tags: ['autodocs', 'class', 'diagram', 'uml'],
        description: 'Class diagram example showing animal class hierarchy',
        componentName: 'MermaidDiagram'
      },
      {
        id: 'mermaid-diagram-state',
        title: 'Components/MermaidDiagram - State Diagram',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--statediagram',
        tags: ['autodocs', 'state', 'diagram'],
        description: 'State diagram example showing data fetching state machine',
        componentName: 'MermaidDiagram'
      },
      {
        id: 'mermaid-diagram-gantt',
        title: 'Components/MermaidDiagram - Gantt Chart',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--ganttchart',
        tags: ['autodocs', 'gantt', 'chart', 'timeline'],
        description: 'Gantt chart example showing project timeline',
        componentName: 'MermaidDiagram'
      },
      {
        id: 'mermaid-diagram-pie',
        title: 'Components/MermaidDiagram - Pie Chart',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--piechart',
        tags: ['autodocs', 'pie', 'chart'],
        description: 'Pie chart example showing tech stack distribution',
        componentName: 'MermaidDiagram'
      },
      {
        id: 'mermaid-diagram-git',
        title: 'Components/MermaidDiagram - Git Graph',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--gitgraph',
        tags: ['autodocs', 'git', 'graph', 'branching'],
        description: 'Git graph example showing branching strategy',
        componentName: 'MermaidDiagram'
      },
      {
        id: 'mermaid-diagram-er',
        title: 'Components/MermaidDiagram - Entity Relationship',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--entityrelationship',
        tags: ['autodocs', 'er', 'diagram', 'database'],
        description: 'Entity relationship diagram example showing e-commerce database structure',
        componentName: 'MermaidDiagram'
      },
      {
        id: 'mermaid-diagram-journey',
        title: 'Components/MermaidDiagram - User Journey',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--userjourney',
        tags: ['autodocs', 'journey', 'user', 'experience'],
        description: 'User journey map example showing shopping experience',
        componentName: 'MermaidDiagram'
      },
      {
        id: 'mermaid-diagram-advanced',
        title: 'Components/MermaidDiagram - Advanced Git Graph',
        type: 'story' as const,
        path: '?path=/story/components-mermaiddiagram--advancedgitgraph',
        tags: ['autodocs', 'git', 'advanced', 'custom-theme'],
        description: 'Advanced Git branching workflow with custom theme',
        componentName: 'MermaidDiagram'
      }
    ];
  }

  private async extractDocsData(): Promise<SearchResult[]> {
    // Static data based on current MDX files
    return [
      {
        id: 'mermaid-diagram-docs',
        title: 'Components/MermaidDiagram/Documentation',
        type: 'docs' as const,
        path: '?path=/docs/components-mermaiddiagram-documentation--page',
        headings: [
          'Mermaid Diagram Component',
          'Overview',
          'Features',
          'Installation',
          'Basic Usage',
          'API Reference',
          'Diagram Types',
          'Flowcharts',
          'Sequence Diagrams',
          'Class Diagrams',
          'State Diagrams',
          'Gantt Charts',
          'Pie Charts',
          'Git Graphs',
          'Entity Relationship Diagrams',
          'User Journey Maps',
          'Theming',
          'Error Handling',
          'Accessibility',
          'Performance'
        ],
        tags: ['documentation', 'mermaid', 'component', 'guide'],
        description: 'Complete documentation for the MermaidDiagram component including examples and API reference.'
      },
      {
        id: 'tokens-docs',
        title: 'Design Tokens',
        type: 'docs' as const,
        path: '?path=/docs/design-tokens--page',
        headings: [
          'Design Tokens',
          'Color System',
          'Typography',
          'Spacing',
          'Breakpoints',
          'Shadows',
          'Border Radius',
          'Usage Guidelines'
        ],
        tags: ['documentation', 'tokens', 'design', 'system'],
        description: 'Design system tokens and guidelines for consistent styling.'
      },
      {
        id: 'tokens-builtin-docs',
        title: 'Built-in Tokens',
        type: 'docs' as const,
        path: '?path=/docs/built-in-tokens--page',
        headings: [
          'Built-in Tokens',
          'CSS Custom Properties',
          'Color Tokens',
          'Spacing Tokens',
          'Typography Tokens',
          'Component Tokens'
        ],
        tags: ['documentation', 'tokens', 'css', 'variables'],
        description: 'Built-in design tokens available as CSS custom properties.'
      }
    ];
  }
}