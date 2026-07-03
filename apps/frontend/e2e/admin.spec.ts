import { test, expect } from '@playwright/test';

test.describe('Administration Route Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/administration');
    await page.locator('.skeleton').first().waitFor({ state: 'hidden' });
  });

  test('should display the correct page heading', async ({ page }) => {
    // Assert that the header renders exactly as expected[cite: 5]
    const heading = await page.locator('h1').first();
    await expect(heading).toHaveText('Administrácia');
  });
});
