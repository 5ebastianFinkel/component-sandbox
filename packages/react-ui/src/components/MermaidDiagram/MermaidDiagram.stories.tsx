import type { Meta, StoryObj } from '@storybook/react';
import { MermaidDiagram } from './MermaidDiagram';

const meta = {
  title: 'Components/MermaidDiagram',
  component: MermaidDiagram,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A React component for rendering Mermaid diagrams with full support for all diagram types.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    chart: {
      control: 'text',
      description: 'The Mermaid diagram definition',
    },
    className: {
      control: 'text',
      description: 'Optional CSS class name',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessibility label for the diagram',
    },
    config: {
      control: 'object',
      description: 'Optional Mermaid configuration object',
    },
    scale: {
      control: { type: 'range', min: 0.5, max: 3, step: 0.1 },
      description: 'Scale factor for the diagram',
      defaultValue: 1,
    },
  },
} satisfies Meta<typeof MermaidDiagram>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Flowchart: Story = {
  args: {
    chart: `graph TD
      A[Start] --> B{Is it working?}
      B -->|Yes| C[Great!]
      B -->|No| D[Debug]
      D --> B
      C --> E[Deploy]
      E --> F[Celebrate]`,
    ariaLabel: 'Software development workflow diagram',
  },
};

export const SequenceDiagram: Story = {
  args: {
    chart: `sequenceDiagram
      participant User
      participant Browser
      participant Server
      participant Database
      
      User->>Browser: Click button
      Browser->>Server: HTTP Request
      Server->>Database: Query data
      Database-->>Server: Return results
      Server-->>Browser: JSON Response
      Browser-->>User: Update UI`,
    ariaLabel: 'Web application request flow sequence diagram',
  },
};

export const ClassDiagram: Story = {
  args: {
    chart: `classDiagram
      class Animal {
        +String name
        +int age
        +makeSound()
      }
      
      class Dog {
        +String breed
        +bark()
        +wagTail()
      }
      
      class Cat {
        +String color
        +meow()
        +scratch()
      }
      
      Animal <|-- Dog
      Animal <|-- Cat`,
    ariaLabel: 'Animal class hierarchy diagram',
  },
};

export const StateDiagram: Story = {
  args: {
    chart: `stateDiagram-v2
      [*] --> Idle
      Idle --> Loading : Start fetch
      Loading --> Success : Data received
      Loading --> Error : Request failed
      Success --> Idle : Reset
      Error --> Idle : Retry
      Error --> [*] : Give up`,
    ariaLabel: 'Data fetching state machine diagram',
  },
};

export const GanttChart: Story = {
  args: {
    chart: `gantt
      title Project Timeline
      dateFormat YYYY-MM-DD
      section Planning
      Requirements     :done,    des1, 2024-01-01, 2024-01-07
      Design          :done,    des2, 2024-01-08, 2024-01-14
      section Development
      Backend         :active,  dev1, 2024-01-15, 30d
      Frontend        :         dev2, after dev1, 20d
      section Testing
      Unit Tests      :         test1, after dev1, 15d
      Integration     :         test2, after dev2, 10d`,
    ariaLabel: 'Project timeline Gantt chart',
  },
};

export const PieChart: Story = {
  args: {
    chart: `pie title Tech Stack Distribution
      "React" : 45
      "Vue" : 25
      "Angular" : 15
      "Others" : 15`,
    ariaLabel: 'Technology stack distribution pie chart',
  },
};

export const GitGraph: Story = {
  args: {
    chart: `gitGraph
      commit
      commit
      branch develop
      checkout develop
      commit
      commit
      checkout main
      merge develop
      commit
      branch feature
      checkout feature
      commit
      commit
      checkout develop
      merge feature
      checkout main
      merge develop`,
    ariaLabel: 'Git branching strategy diagram',
  },
};

export const EntityRelationship: Story = {
  args: {
    chart: `erDiagram
      CUSTOMER ||--o{ ORDER : places
      ORDER ||--|{ LINE-ITEM : contains
      PRODUCT ||--o{ LINE-ITEM : includes
      CUSTOMER {
        string name
        string email
        string phone
      }
      ORDER {
        int orderNumber
        date orderDate
        string status
      }
      LINE-ITEM {
        int quantity
        float price
      }
      PRODUCT {
        string name
        string sku
        float price
      }`,
    ariaLabel: 'E-commerce database entity relationship diagram',
  },
};

export const UserJourney: Story = {
  args: {
    chart: `journey
      title User Shopping Journey
      section Browse
        Visit Homepage: 5: User
        Search Products: 4: User
        View Categories: 4: User
      section Select
        View Product: 5: User
        Read Reviews: 3: User
        Compare Items: 2: User
      section Purchase
        Add to Cart: 5: User
        Checkout: 3: User
        Payment: 2: User
        Confirmation: 5: User`,
    ariaLabel: 'User shopping journey map',
  },
};

export const CustomTheme: Story = {
  args: {
    chart: `graph LR
      A[Input] --> B[Process]
      B --> C[Output]
      B --> D[Log]
      D --> E[Archive]`,
    ariaLabel: 'Data processing flow with custom theme',
    config: {
      theme: 'dark',
    },
  },
};

export const Interactive: Story = {
  args: {
    chart: `graph TD
      A[Click me] --> B[Then me]
      B --> C[And finally me]
      
      click A "https://mermaid.js.org" "Visit Mermaid docs"
      click B "https://storybook.js.org" "Visit Storybook docs"
      click C "https://react.dev" "Visit React docs"`,
    ariaLabel: 'Interactive flowchart with clickable nodes',
  },
};

export const AdvancedGitGraph: Story = {
  parameters: {
    layout: 'padded',
  },
  args: {
    className: 'largeDiagram',
    scale: 1,
    chart: `%%{init: { 
  'theme': 'base',
  'themeVariables': {
    'primaryColor': '#f9f9f9',
    'primaryTextColor': '#333',
    'primaryBorderColor': '#ddd',
    'lineColor': '#333',
    'secondaryColor': '#f3f3f3',
    'tertiaryColor': '#fff',
    'git0': '#0066cc',
    'git1': '#009900',
    'git2': '#ff6600',
    'git3': '#9933cc',
    'git4': '#00cccc',
    'git5': '#cc3300',
    'git6': '#996633',
    'git7': '#666666',
    'gitBranchLabel0': '#ffffff',
    'gitBranchLabel1': '#ffffff',
    'gitBranchLabel2': '#ffffff',
    'gitBranchLabel3': '#ffffff',
    'gitBranchLabel4': '#ffffff',
    'gitBranchLabel5': '#ffffff',
    'gitBranchLabel6': '#ffffff',
    'gitBranchLabel7': '#ffffff',
    'commitLabelColor': '#000000',
    'commitLabelBackground': '#ffffff',
    'commitLabelFontSize': '16px',
    'tagLabelColor': '#000000',
    'tagLabelBackground': '#ffeb3b',
    'tagLabelBorder': '#ff9800',
    'tagLabelFontSize': '16px',
    'mainBranchName': 'main',
    'mainBranchOrder': 0,
    'showCommitLabel': true,
    'showBranches': true,
    'rotateCommitLabel': false
  }
}}%%

gitGraph
    commit id: "Initial commit"
    branch dev
    checkout dev
    commit id: "Dev setup"
    
    branch feature/user-auth
    checkout feature/user-auth
    commit id: "Add login page"
    commit id: "Add authentication"
    checkout dev
    merge feature/user-auth
    
    branch feature/dashboard
    checkout feature/dashboard
    commit id: "Create dashboard layout"
    commit id: "Add widgets"
    checkout dev
    merge feature/dashboard
    
    checkout main
    merge dev tag: "v1.0.0"
    
    checkout dev
    commit id: "Start v1.1 development"
    
    branch feature/api-integration
    checkout feature/api-integration
    commit id: "Add API client"
    commit id: "Implement endpoints"
    checkout dev
    merge feature/api-integration
    
    branch feature/performance
    checkout feature/performance
    commit id: "Optimize queries"
    commit id: "Add caching"
    checkout dev
    merge feature/performance
    
    checkout main
    merge dev tag: "v1.1.0"
    
    checkout dev
    commit id: "Start v1.2 development"`,
    ariaLabel: 'Advanced Git branching workflow with custom theme',
  },
};