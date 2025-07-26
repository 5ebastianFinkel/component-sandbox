import { test, expect } from '@playwright/test';

test.describe('Search Dialog - All Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=components-searchdialog-feature-tests--basic-search&viewMode=story');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Basic Search', () => {
    test('should search for component names', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      await searchInput.fill('button');
      
      // Check results appear
      await expect(page.getByText('Button - Primary')).toBeVisible();
      await expect(page.getByText('Button - Secondary')).toBeVisible();
    });

    test('should search in documentation', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      await searchInput.fill('design');
      
      await expect(page.getByText('Design System Overview')).toBeVisible();
    });

    test('should show no results message', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      await searchInput.fill('nonexistentcomponent123');
      
      await expect(page.getByText('No results found')).toBeVisible();
    });
  });

  test.describe('Search Shortcuts', () => {
    test('s: shortcut should filter stories only', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--search-shortcuts&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('s: button');
      
      // Should only show story results
      await expect(page.getByText('Button - Primary')).toBeVisible();
      await expect(page.getByText('Button - Secondary')).toBeVisible();
      
      // Should not show documentation
      await expect(page.getByText('Documentation')).not.toBeVisible();
    });

    test('d: shortcut should filter documentation only', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--search-shortcuts&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('d: api');
      
      // Should only show documentation results
      await expect(page.getByText('API Reference')).toBeVisible();
      
      // Should not show stories
      await expect(page.getByText('Stories')).not.toBeVisible();
    });

    test('c: shortcut should search by component name', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--search-shortcuts&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('c: modal');
      
      // Should find Modal component
      await expect(page.getByText('Modal - Dialog Window')).toBeVisible();
    });

    test('t: shortcut should search by tags', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--search-shortcuts&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('t: accessibility');
      
      // Should find items with accessibility tag
      await expect(page.getByText('Modal - Dialog Window')).toBeVisible();
      await expect(page.getByText('Accessibility Guidelines')).toBeVisible();
    });

    test('h: shortcut should search in headings', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--search-shortcuts&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('h: typography');
      
      // Should find docs with Typography heading
      await expect(page.getByText('Design System Overview')).toBeVisible();
      
      // Should only show documentation
      await expect(page.getByText('Documentation')).toBeVisible();
      await expect(page.getByText('Stories')).not.toBeVisible();
    });

    test('new: shortcut should limit results', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--search-shortcuts&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('new: guide');
      
      // Should find items tagged as new
      await expect(page.getByText('Getting Started Guide')).toBeVisible();
    });
  });

  test.describe('Grouped Results', () => {
    test('should group results by type', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--grouped-results&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('component');
      
      // Should show both groups
      await expect(page.getByText('Stories')).toBeVisible();
      await expect(page.getByText('Documentation')).toBeVisible();
    });

    test('should only show groups with results', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--grouped-results&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('button');
      
      // Should only show Stories group
      await expect(page.getByText('Stories')).toBeVisible();
      await expect(page.getByText('Documentation')).not.toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate with arrow keys', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--keyboard-navigation&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('button');
      
      // Navigate down
      await page.keyboard.press('ArrowDown');
      
      // First result should be highlighted (check aria-selected)
      const firstResult = page.locator('[cmdk-item]').first();
      await expect(firstResult).toHaveAttribute('aria-selected', 'true');
      
      // Navigate down again
      await page.keyboard.press('ArrowDown');
      
      // Second result should be highlighted
      const secondResult = page.locator('[cmdk-item]').nth(1);
      await expect(secondResult).toHaveAttribute('aria-selected', 'true');
      
      // Navigate up
      await page.keyboard.press('ArrowUp');
      await expect(firstResult).toHaveAttribute('aria-selected', 'true');
    });

    test('should select with Enter key', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--keyboard-navigation&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('button');
      await page.keyboard.press('ArrowDown');
      
      // Press Enter to select
      await page.keyboard.press('Enter');
      
      // Dialog should close (not visible)
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    test('should close with Escape key', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--keyboard-navigation&viewMode=story');
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Dialog should close
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test.describe('Search History', () => {
    test('should show recent searches when opened', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--search-history&viewMode=story');
      
      // Should show recent searches
      await expect(page.getByText('Recent Searches')).toBeVisible();
      
      // Should show some of the pre-populated searches
      const recentSearches = ['button', 'modal', 'accessibility', 'design system'];
      for (const search of recentSearches.slice(0, 2)) {
        await expect(page.getByText(search)).toBeVisible();
      }
    });

    test('should perform search when clicking recent item', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--search-history&viewMode=story');
      
      // Click on a recent search
      await page.getByText('button').first().click();
      
      // Should show button results
      await expect(page.getByText('Button - Primary')).toBeVisible();
    });

    test('should add new searches to history', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--search-history&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      // Perform a new search
      await searchInput.fill('input');
      await page.waitForTimeout(200); // Wait for debounce
      
      // Clear and reopen to see history
      await searchInput.clear();
      await page.waitForTimeout(200);
      
      // The new search should appear in recent searches
      await expect(page.getByText('input')).toBeVisible();
    });
  });

  test.describe('Tags and Categories', () => {
    test('should search by tag names', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--tags-and-categories&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('interactive');
      
      // Should find components with interactive tag
      await expect(page.getByText('Button - Primary')).toBeVisible();
      await expect(page.getByText('Input - Text Field')).toBeVisible();
      await expect(page.getByText('Modal - Dialog Window')).toBeVisible();
    });

    test('should find autodocs components', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--tags-and-categories&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('autodocs');
      
      // Should find components with autodocs tag
      await expect(page.getByText('Button - Primary')).toBeVisible();
    });
  });

  test.describe('Heading Search', () => {
    test('should find documents by heading content', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--heading-search&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('installation');
      
      // Should find Getting Started Guide which has Installation heading
      await expect(page.getByText('Getting Started Guide')).toBeVisible();
    });

    test('should boost heading matches with h: shortcut', async ({ page }) => {
      await page.goto('/iframe.html?id=components-searchdialog-feature-tests--heading-search&viewMode=story');
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('h: dark mode');
      
      // Should find Theming docs with Dark Mode heading
      await expect(page.getByText('Theming and Customization')).toBeVisible();
    });
  });

  test.describe('Real-time Search', () => {
    test('should update results as user types', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      // Type slowly to see real-time updates
      await searchInput.pressSequentially('but', { delay: 100 });
      
      // Should show partial matches
      await expect(page.getByText('Button - Primary')).toBeVisible();
      
      // Continue typing
      await searchInput.pressSequentially('ton', { delay: 100 });
      
      // Results should still be visible
      await expect(page.getByText('Button - Primary')).toBeVisible();
    });

    test('should debounce search requests', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      // Type quickly
      await searchInput.fill('design system');
      
      // Results should appear after debounce
      await expect(page.getByText('Design System Overview')).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle special characters in search', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      await searchInput.fill('API & Reference');
      
      // Should still find API Reference
      await expect(page.getByText('API Reference')).toBeVisible();
    });

    test('should handle very long search queries', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      const longQuery = 'this is a very long search query that should still work properly even though it is much longer than typical searches';
      await searchInput.fill(longQuery);
      
      // Should show no results
      await expect(page.getByText('No results found')).toBeVisible();
    });

    test('should clear search when input is emptied', async ({ page }) => {
      const searchInput = page.getByPlaceholder('Search stories and documentation...');
      
      // Search for something
      await searchInput.fill('button');
      await expect(page.getByText('Button - Primary')).toBeVisible();
      
      // Clear search
      await searchInput.clear();
      
      // Should show recent searches again
      await expect(page.getByText('Recent Searches')).toBeVisible();
    });
  });
});