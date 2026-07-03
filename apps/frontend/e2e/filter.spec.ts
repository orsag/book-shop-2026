import { test, expect } from '@playwright/test';

test.describe('Filter Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('.skeleton').first().waitFor({ state: 'hidden' });

    const filter = page.getByTestId('filter-component');
    const isFilterVisible = await filter.isVisible();

    // If the filter component is not visible, click the logo/toggle button to open it
    if (!isFilterVisible) {
      // Replace 'logo-btn' with the actual data-testid of your logo or toggle button
      await page.getByTestId('logo-btn').click();

      // Optional: wait for the filter to become visible after clicking
      await expect(filter).toBeVisible();
    }
  });

  test('should toggle layout and display grid main-layout when clicking layout button', async ({
    page,
  }) => {
    // 1. Click on data-testid="layout-btn"[cite: 3]
    const button = page.getByTestId("layout-btn");
    await button.isVisible();
    await button.click();

    // Check if visible layout is data-testid="main-layout-grid"
    const gridLayout = page.getByTestId('main-layout-grid');
    await expect(gridLayout).toBeVisible();

    await button.click();
    // Check if visible layout is data-testid="main-layout-list"
    const listLayout = page.getByTestId('main-layout-list');
    await expect(listLayout).toBeVisible();
  });

  test('should sort elements by price ascending when clicking price button', async ({
    page,
  }) => {
    // 2. Click data-testid="price-btn"[cite: 3]
    await page.getByTestId('price-btn').click();

    // Give the layout a brief moment to re-render sorted results
    await page.locator('.skeleton').first().waitFor({ state: 'hidden' });
    // await page.waitForTimeout(1000);

    const listItems = page.locator('app-book-list-item');

    // Extract raw text strings hidden inside the title="pricing" span for the first two items
    const firstItemPriceText = await listItems
      .nth(0)
      .locator('span[title="pricing"]')
      .textContent();
    const secondItemPriceText = await listItems
      .nth(1)
      .locator('span[title="pricing"]')
      .textContent();

    // Clean out currencies/spaces and convert strings to floating numbers
    const price1 = parseFloat(
      firstItemPriceText?.replace(/[^0-9.]/g, '') || '0',
    );
    const price2 = parseFloat(
      secondItemPriceText?.replace(/[^0-9.]/g, '') || '0',
    );

    // Compare if item 0 has a lower price than or equal to item 1
    expect(price1).toBeLessThanOrEqual(price2);
  });

  test('should display discount badges when clicking discount button', async ({
    page,
  }) => {
    // 3. Click data-testid="discount-btn"[cite: 3]
    await page.getByTestId('discount-btn').click();

    // Give filters a tiny moment to apply state changes[cite: 4]
    await page.locator('.skeleton').first().waitFor({ state: 'hidden' });
    // await page.waitForTimeout(1000);

    // Grab the first item and verify it contains a visible discount span element
    const firstItemDiscountSpan = page
      .locator('app-book-list-item')
      .nth(0)
      .locator('span[title="discount"]');
    await expect(firstItemDiscountSpan).toBeVisible();
  });
});
