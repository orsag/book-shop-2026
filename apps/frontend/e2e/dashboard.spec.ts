import { test, expect } from '@playwright/test';
import { DEFAULT_MAX_LIMIT } from '@store/libs';

test.describe('Dashboard Layout & Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.skeleton').first().waitFor({ state: 'hidden' });
  });

  test('should display exact number of book list items and zero book cards in list view', async ({
    page,
  }) => {
    // 1. Verify number of app-book-list-item is equal to DEFAULT_MAX_LIMIT
    const listItems = page.locator('app-book-list-item');
    await expect(listItems).toHaveCount(DEFAULT_MAX_LIMIT);

    // 2. Verify number of app-book-card is zero[cite: 1]
    const bookCards = page.locator('app-book-card');
    await expect(bookCards).toHaveCount(0);
  });

  test('should display double of products when Load more books', async ({ page }) => {
    // Playwright locator will look for all instances matching the test id
    const loadMoreButton = page.getByTestId('load-more');
    await loadMoreButton.click();

    await page.locator('.skeleton').first().waitFor({ state: 'hidden' });
    const listItems = page.locator('app-book-list-item');
    await expect(listItems).toHaveCount(2 * DEFAULT_MAX_LIMIT);
  });

  test('should add the first item to the cart', async ({ page }) => {
    const listItems = page.locator('app-book-list-item');
    const ADD_LABEL = 'Do košíka';
    const REMOVE_LABEL = 'Odobrať';

    // Isolate the first book item (index 0)
    const firstItem = listItems.nth(0);
    await expect(firstItem).toBeVisible();

    const firstItemButton = firstItem.getByTestId('add-to-cart');
    await expect(firstItemButton).toBeVisible();

    // Verify initial state
    await expect(firstItemButton).toHaveText(ADD_LABEL);
    // Click to add to cart
    await firstItemButton.click();
    // Verify it changed to "Remove cart"
    await expect(firstItemButton).toHaveText(REMOVE_LABEL);
  });
});
