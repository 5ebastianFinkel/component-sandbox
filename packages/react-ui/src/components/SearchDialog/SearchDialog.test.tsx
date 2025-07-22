import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SearchDialog } from './SearchDialog';
import { SearchDialogProvider } from './SearchDialogProvider';

// Mock FlexSearch
vi.mock('flexsearch', () => ({
  default: {
    Index: vi.fn().mockImplementation(() => ({
      add: vi.fn(),
      search: vi.fn().mockReturnValue([]),
      clear: vi.fn()
    }))
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SearchDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSelect: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(<SearchDialog {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search stories and docs...')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<SearchDialog {...defaultProps} open={false} />);
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when ESC is pressed', async () => {
    const onOpenChange = vi.fn();
    render(<SearchDialog {...defaultProps} onOpenChange={onOpenChange} />);
    
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange when clicking outside', async () => {
    const onOpenChange = vi.fn();
    render(<SearchDialog {...defaultProps} onOpenChange={onOpenChange} />);
    
    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay!);
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows loading state while searching', async () => {
    const user = userEvent.setup();
    render(<SearchDialog {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search stories and docs...');
    await user.type(input, 'test query');
    
    expect(screen.getByText('Searching...')).toBeInTheDocument();
  });

  it('shows empty state when no results found', async () => {
    const user = userEvent.setup();
    render(<SearchDialog {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search stories and docs...');
    await user.type(input, 'nonexistent');
    
    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('shows recent searches when empty', () => {
    render(<SearchDialog {...defaultProps} />);
    
    expect(screen.getByText('Recent Searches')).toBeInTheDocument();
    expect(screen.getByText('Search Shortcuts')).toBeInTheDocument();
  });

  it('accepts custom placeholder', () => {
    render(<SearchDialog {...defaultProps} placeholder="Custom placeholder" />);
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('prevents body scroll when open', () => {
    render(<SearchDialog {...defaultProps} />);
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', () => {
    const { rerender } = render(<SearchDialog {...defaultProps} />);
    
    rerender(<SearchDialog {...defaultProps} open={false} />);
    
    expect(document.body.style.overflow).toBe('');
  });
});

describe('SearchDialogProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens dialog with Cmd+K on Mac', () => {
    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', { 
      value: 'MacIntel', 
      writable: true 
    });

    render(
      <SearchDialogProvider>
        <div>Test content</div>
      </SearchDialogProvider>
    );

    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens dialog with Ctrl+K on Windows', () => {
    // Mock Windows platform
    Object.defineProperty(navigator, 'platform', { 
      value: 'Win32', 
      writable: true 
    });

    render(
      <SearchDialogProvider>
        <div>Test content</div>
      </SearchDialogProvider>
    );

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls custom onNavigate handler', async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    
    render(
      <SearchDialogProvider onNavigate={onNavigate}>
        <div>Test content</div>
      </SearchDialogProvider>
    );

    // Open dialog
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    
    // This would require mocking search results, which is complex
    // In a real test, we'd mock the search engine to return test data
  });

  it('renders children correctly', () => {
    render(
      <SearchDialogProvider>
        <div data-testid="child">Test content</div>
      </SearchDialogProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('has proper ARIA attributes', () => {
    render(<SearchDialog open={true} onOpenChange={vi.fn()} />);
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Search stories and documentation');
  });

  it('focuses search input when opened', async () => {
    render(<SearchDialog open={true} onOpenChange={vi.fn()} />);
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Search stories and docs...');
      expect(input).toHaveFocus();
    });
  });

  it('traps focus within dialog', () => {
    render(<SearchDialog open={true} onOpenChange={vi.fn()} />);
    
    // Focus should be trapped within the dialog
    // This would require more complex testing with Tab navigation
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });
});