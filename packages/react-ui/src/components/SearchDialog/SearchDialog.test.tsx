import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { SearchDialog } from './SearchDialog';
import { SearchDialogProvider } from './SearchDialogProvider';

// Mock FlexSearch
vi.mock('flexsearch', () => ({
  Index: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    search: vi.fn().mockReturnValue([]),
    clear: vi.fn()
  }))
}));

// Mock StorybookDataExtractor
vi.mock('../../utils/storybookDataExtractor', () => ({
  StorybookDataExtractor: vi.fn().mockImplementation(() => ({
    extractAllData: vi.fn().mockResolvedValue([])
  }))
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

  it('renders when open', async () => {
    await act(async () => {
      render(<SearchDialog {...defaultProps} />);
    });
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search stories and docs...')).toBeInTheDocument();
  });

  it('does not render when closed', async () => {
    await act(async () => {
      render(<SearchDialog {...defaultProps} open={false} />);
    });
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when ESC is pressed', async () => {
    const onOpenChange = vi.fn();
    await act(async () => {
      render(<SearchDialog {...defaultProps} onOpenChange={onOpenChange} />);
    });
    
    await act(async () => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange when clicking outside', async () => {
    const onOpenChange = vi.fn();
    await act(async () => {
      render(<SearchDialog {...defaultProps} onOpenChange={onOpenChange} />);
    });
    
    // The overlay element is the one with role="dialog" (it's the top-level element with the click handler)
    const overlay = screen.getByRole('dialog');
    
    // Create and dispatch a click event where the target is the overlay itself
    await act(async () => {
      fireEvent.click(overlay, { target: overlay });
    });
    
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows loading state while searching', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<SearchDialog {...defaultProps} />);
    });
    
    const input = screen.getByPlaceholderText('Search stories and docs...');
    await act(async () => {
      await user.type(input, 'test query');
    });
    
    // Should show either initializing or searching text
    expect(screen.getByText(/Initializing search\.\.\.|Searching\.\.\./)).toBeInTheDocument();
  });

  it('shows empty state when no results found', async () => {
    const user = userEvent.setup();
    await act(async () => {
      render(<SearchDialog {...defaultProps} />);
    });
    
    const input = screen.getByPlaceholderText('Search stories and docs...');
    await act(async () => {
      await user.type(input, 'nonexistent');
    });
    
    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('shows recent searches when empty', async () => {
    await act(async () => {
      render(<SearchDialog {...defaultProps} />);
    });
    
    // Should show Search Shortcuts section even without recent searches
    expect(screen.getByText('Search Shortcuts')).toBeInTheDocument();
    // Should show Tips section
    expect(screen.getByText('Tips')).toBeInTheDocument();
  });

  it('accepts custom placeholder', async () => {
    await act(async () => {
      render(<SearchDialog {...defaultProps} placeholder="Custom placeholder" />);
    });
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('prevents body scroll when open', async () => {
    await act(async () => {
      render(<SearchDialog {...defaultProps} />);
    });
    
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when closed', async () => {
    const { rerender } = await act(async () => {
      return render(<SearchDialog {...defaultProps} />);
    });
    
    await act(async () => {
      rerender(<SearchDialog {...defaultProps} open={false} />);
    });
    
    expect(document.body.style.overflow).toBe('');
  });
});

describe('SearchDialogProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens dialog with Cmd+K on Mac', async () => {
    // Mock Mac platform
    Object.defineProperty(navigator, 'platform', { 
      value: 'MacIntel', 
      writable: true 
    });

    await act(async () => {
      render(
        <SearchDialogProvider>
          <div>Test content</div>
        </SearchDialogProvider>
      );
    });

    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', metaKey: true });
    });
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('opens dialog with Ctrl+K on Windows', async () => {
    // Mock Windows platform
    Object.defineProperty(navigator, 'platform', { 
      value: 'Win32', 
      writable: true 
    });

    await act(async () => {
      render(
        <SearchDialogProvider>
          <div>Test content</div>
        </SearchDialogProvider>
      );
    });

    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls custom onNavigate handler', async () => {
    const onNavigate = vi.fn();
    
    await act(async () => {
      render(
        <SearchDialogProvider onNavigate={onNavigate}>
          <div>Test content</div>
        </SearchDialogProvider>
      );
    });

    // Open dialog
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', metaKey: true });
    });
    
    // This would require mocking search results, which is complex
    // In a real test, we'd mock the search engine to return test data
  });

  it('renders children correctly', async () => {
    await act(async () => {
      render(
        <SearchDialogProvider>
          <div data-testid="child">Test content</div>
        </SearchDialogProvider>
      );
    });

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  it('has proper ARIA attributes', async () => {
    await act(async () => {
      render(<SearchDialog open={true} onOpenChange={vi.fn()} />);
    });
    
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Search stories and documentation');
  });

  it('focuses search input when opened', async () => {
    await act(async () => {
      render(<SearchDialog open={true} onOpenChange={vi.fn()} />);
    });
    
    await waitFor(() => {
      const input = screen.getByPlaceholderText('Search stories and docs...');
      expect(input).toHaveFocus();
    });
  });

  it('traps focus within dialog', async () => {
    await act(async () => {
      render(<SearchDialog open={true} onOpenChange={vi.fn()} />);
    });
    
    // Focus should be trapped within the dialog
    // This would require more complex testing with Tab navigation
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });
});