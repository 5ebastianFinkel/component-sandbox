import type { Meta, StoryObj } from '@storybook/react';
import { SearchDialogProvider } from './SearchDialogProvider';
import { SearchDialog } from './SearchDialog';
import { useState } from 'react';
import { SearchResult } from '../../utils/searchIndexBuilder';

const meta = {
  title: 'Components/SearchDialog',
  component: SearchDialog,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A powerful search dialog for Storybook that allows users to quickly find stories and documentation using keyboard shortcuts.',
      },
    },
  },
  tags: ['autodocs', 'search', 'dialog', 'navigation'],
} satisfies Meta<typeof SearchDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic search dialog story  
export const Default: Story = {
  args: {
    open: false,
    onOpenChange: () => {}
  },
  render: () => {
    const [open, setOpen] = useState(false);
    
    const handleSelect = (result: SearchResult) => {
      console.log('Selected:', result);
      alert(`Selected: ${result.title}`);
    };

    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
        <h2>Search Dialog Demo</h2>
        <p>Click the button below or press <kbd>Cmd/Ctrl + K</kbd> to open the search dialog.</p>
        
        <button 
          onClick={() => setOpen(true)}
          style={{
            background: '#0969da',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Open Search Dialog
        </button>

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#656d76' }}>
          <p><strong>Try searching for:</strong></p>
          <ul>
            <li>mermaid</li>
            <li>diagram</li>
            <li>flowchart</li>
            <li>documentation</li>
            <li>tokens</li>
          </ul>
        </div>

        <SearchDialog
          open={open}
          onOpenChange={setOpen}
          onSelect={handleSelect}
        />
      </div>
    );
  },
};

// With provider story
export const WithProvider: Story = {
  args: {
    open: false,
    onOpenChange: () => {}
  },
  render: () => {
    const handleNavigate = (result: SearchResult) => {
      console.log('Navigate to:', result);
      alert(`Would navigate to: ${result.title}`);
    };

    const handleError = (error: Error, result: SearchResult) => {
      console.error('Navigation error:', error);
      alert(`Navigation failed for: ${result.title}`);
    };

    return (
      <SearchDialogProvider 
        onNavigate={handleNavigate} 
        onError={handleError}
      >
        <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
          <h2>Search Dialog with Provider</h2>
          <p>Press <kbd>Cmd/Ctrl + K</kbd> anywhere on this page to open the search dialog.</p>
          
          <div style={{ 
            background: '#f6f8fa', 
            border: '1px solid #d0d7de', 
            borderRadius: '6px',
            padding: '16px',
            marginTop: '20px'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Global Search Features:</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
              <li>Global <kbd>Cmd/Ctrl + K</kbd> shortcut</li>
              <li>Real-time search with debouncing</li>
              <li>Grouped results (Stories vs Documentation)</li>
              <li>Keyboard navigation with arrow keys</li>
              <li>ESC or click outside to close</li>
              <li>Custom navigation handlers</li>
            </ul>
          </div>

          <div style={{ marginTop: '20px' }}>
            <p><strong>This area has focus and you can still trigger the search:</strong></p>
            <textarea 
              placeholder="Type here and press Cmd/Ctrl + K to test global shortcut..."
              style={{
                width: '100%',
                height: '100px',
                padding: '12px',
                border: '1px solid #d0d7de',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </SearchDialogProvider>
    );
  },
};

// Open state story for testing
export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    onSelect: (result: SearchResult) => {
      console.log('Selected:', result);
    },
  },
};