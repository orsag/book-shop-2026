import { test, expect } from '@playwright/test';

test.describe('Navbar Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure the interface is settled before interacting with the navbar
    await page.locator('.skeleton').first().waitFor({ state: 'hidden' });
  });

  test('should toggle language to EN when language button is clicked', async ({
    page,
  }) => {
    // 1. Click data-testid="language-btn"
    const languageBtn = page.getByTestId('language-btn');
    await languageBtn.click();

    // Check if <span title="language"> switched to 'EN'
    const languageSpan = page.locator('span[title="language"]');
    await expect(languageSpan).toHaveText('EN');
  });

  test('should open profile modal and verify admin span when profile button is clicked', async ({
    page,
  }) => {
    // 2. Click data-testid="profile-btn"
    const profileBtn = page.getByTestId('profile-btn');
    await profileBtn.click();

    // Check if data-testid="profile-modal" is visible
    const profileModal = page.getByTestId('profile-modal');
    await expect(profileModal).toBeVisible();

    // Check if <span title="admin"> is visible inside the modal or layout
    const adminSpan = page.locator('span[title="admin"]');
    await expect(adminSpan).toBeVisible();

    const themeSpan = page.locator('span[title="theme"]');
    await expect(themeSpan).toBeVisible();
  });
});
