import { test, expect } from '@playwright/test';

test.describe('Storybook Search Dialog', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the SearchDialog story
    await page.goto('/?path=/story/components-searchdialog--with-provider');
  });

  test('opens search dialog with CMD/CTRL+K', async ({ page }) => {
    // Test keyboard shortcut
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    // Check that dialog is visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByPlaceholderText('Search stories and docs...')).toBeFocused();
  });

  test('shows recent searches when opened', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    await expect(page.getByText('Recent Searches')).toBeVisible();
    await expect(page.getByText('Search Shortcuts')).toBeVisible();
  });

  test('performs real-time search', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    const searchInput = page.getByPlaceholderText('Search stories and docs...');
    
    // Type search query
    await searchInput.type('mermaid');
    
    // Wait for search results
    await expect(page.getByText('Stories')).toBeVisible();
    await expect(page.getByText('MermaidDiagram')).toBeVisible();
  });

  test('shows loading state while searching', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    const searchInput = page.getByPlaceholderText('Search stories and docs...');
    
    // Type quickly to catch loading state
    await searchInput.type('test', { delay: 10 });
    
    // Should show loading
    await expect(page.getByText('Searching...')).toBeVisible();
  });

  test('navigates with keyboard arrows', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    const searchInput = page.getByPlaceholderText('Search stories and docs...');
    await searchInput.type('mermaid');
    
    // Wait for results
    await expect(page.getByText('Stories')).toBeVisible();
    
    // Navigate with arrows
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    
    // Should have selection
    await expect(page.locator('[aria-selected="true"]')).toBeVisible();
  });

  test('selects result with Enter key', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    const searchInput = page.getByPlaceholderText('Search stories and docs...');
    await searchInput.type('mermaid');
    
    // Wait for results and select first one
    await expect(page.getByText('Stories')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('closes with ESC key', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    await expect(page.getByRole('dialog')).toBeVisible();
    
    await page.keyboard.press('Escape');
    
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('closes when clicking outside', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click outside the dialog
    await page.click('body', { position: { x: 50, y: 50 } });
    
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('handles search shortcuts', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    const searchInput = page.getByPlaceholderText('Search stories and docs...');
    
    // Test stories-only shortcut
    await searchInput.type('s:mermaid');
    
    // Should show search results filtered to stories only
    await expect(page.getByText('Stories')).toBeVisible();
  });

  test('shows empty state for no results', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    const searchInput = page.getByPlaceholderText('Search stories and docs...');
    await searchInput.type('nonexistentcomponent12345');
    
    await expect(page.getByText('No results found')).toBeVisible();
    await expect(page.getByText('Try searching for component names')).toBeVisible();
  });

  test('is accessible', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    const dialog = page.getByRole('dialog');
    
    // Check ARIA attributes
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-label', 'Search stories and documentation');
    
    // Check focus management
    await expect(page.getByPlaceholderText('Search stories and docs...')).toBeFocused();
  });

  test('works on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Dialog should be responsive
    const dialog = page.locator('[class*="command"]');
    const boundingBox = await dialog.boundingBox();
    
    expect(boundingBox?.width).toBeLessThan(375 * 0.95); // Should fit in viewport with padding
  });

  test('preserves search history across sessions', async ({ page }) => {
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    const searchInput = page.getByPlaceholderText('Search stories and docs...');
    await searchInput.type('mermaid');
    
    // Wait for results and close
    await expect(page.getByText('Stories')).toBeVisible();
    await page.keyboard.press('Escape');
    
    // Reopen and check history
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }
    
    // Should show recent search
    await expect(page.getByText('mermaid')).toBeVisible();
  });

  test('handles dark mode', async ({ page }) => {
    // Enable dark mode if supported
    await page.emulateMedia({ colorScheme: 'dark' });
    
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    
    // Dialog should render in dark mode
    // (Visual testing would be needed to verify actual colors)
  });
});