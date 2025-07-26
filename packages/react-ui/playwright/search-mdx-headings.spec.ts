import { test, expect } from '@playwright/test';

test.describe('SearchDialog MDX Heading Search', () => {
  test('should find MDX headings when searching for "Farben"', async ({ page }) => {
    // Navigate to the Open story where dialog is already visible
    await page.goto('/?path=/story/components-searchdialog--open');
    await page.waitForLoadState('networkidle');
    
    // Wait for search dialog to be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Type "farben" in the search input
    const searchInput = page.getByPlaceholder('Search stories and docs...');
    await searchInput.pressSequentially('farben');
    
    // Wait for search results
    await page.waitForTimeout(500); // Allow debounce
    
    // Check that "Design System Tokens" appears in results
    await expect(page.getByText('Design System/Tokens')).toBeVisible();
  });

  test('should find multiple headings containing "farb"', async ({ page }) => {
    // Navigate to the Open story
    await page.goto('/?path=/story/components-searchdialog--open');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Search for partial text "farb"
    const searchInput = page.getByPlaceholder('Search stories and docs...');
    await searchInput.pressSequentially('farb');
    await page.waitForTimeout(500);
    
    // Check that Design System Tokens result appears
    await expect(page.getByText('Design System/Tokens')).toBeVisible();
  });

  test('should handle case-insensitive search for German headings', async ({ page }) => {
    // Test various case combinations
    const queries = ['FARBEN', 'farben', 'Farben'];
    
    for (const query of queries) {
      // Navigate to fresh Open story
      await page.goto('/?path=/story/components-searchdialog--open');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByRole('dialog')).toBeVisible();
      
      const searchInput = page.getByPlaceholder('Search stories and docs...');
      await searchInput.pressSequentially(query);
      await page.waitForTimeout(500);
      
      // Verify Design System Tokens appears in results
      await expect(page.getByText('Design System/Tokens')).toBeVisible();
    }
  });

  test('should search for other German headings in Tokens.mdx', async ({ page }) => {
    // Test other German headings
    const germanHeadings = ['Verwendung', 'Abstände'];
    
    for (const heading of germanHeadings) {
      // Navigate to fresh Open story
      await page.goto('/?path=/story/components-searchdialog--open');
      await page.waitForLoadState('networkidle');
      
      await expect(page.getByRole('dialog')).toBeVisible();
      
      const searchInput = page.getByPlaceholder('Search stories and docs...');
      await searchInput.pressSequentially(heading);
      await page.waitForTimeout(500);
      
      // Verify Design System Tokens appears in results
      await expect(page.getByText('Design System/Tokens')).toBeVisible();
    }
  });

  test('should test navigation with keyboard shortcut', async ({ page }) => {
    // Navigate to the WithProvider story
    await page.goto('/?path=/story/components-searchdialog--with-provider');
    await page.waitForLoadState('networkidle');
    
    // Press keyboard shortcut to open dialog
    const isMac = process.platform === 'darwin';
    if (isMac) {
      await page.keyboard.press('Meta+k');
    } else {
      await page.keyboard.press('Control+k');
    }
    
    // Wait for dialog to appear
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Search for Farben
    const searchInput = page.getByPlaceholder('Search stories and docs...');
    await searchInput.pressSequentially('Farben');
    await page.waitForTimeout(500);
    
    // Verify result appears
    await expect(page.getByText('Design System/Tokens')).toBeVisible();
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});