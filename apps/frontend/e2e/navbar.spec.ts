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

  test('should open the modal window with corresponding item heading when first item is clicked', async ({ page }) => {
    // 1. target the top icons container grid layout
    const firstFooterLink = page.locator('footer .grid a').nth(0);

    // 2. Extract the expected heading string value from the layout before clicking
    const expectedHeading = await firstFooterLink.locator('span').innerText();

    // 3. Perform user interaction step: Click the first link
    await firstFooterLink.click();

    // 4. Target the native dialog element
    const wipModal = page.getByRole('dialog');

    // 5. Verify that the modal element state switches to visible
    await expect(wipModal).toBeVisible();

    // 6. Target the heading inside the conditional flex section of the modal container
    const modalHeading = wipModal.locator('h3');

    // 7. Verify the modal heading content matches the extracted text layout
    // (Bypassing potential spacing differences with toContainText)
    await expect(modalHeading).toContainText(expectedHeading, {
      ignoreCase: true,
    });

    // 8. Locate the backdrop button inside the dialog and click it
    await wipModal.getByRole('button', { name: 'Zatvoriť' }).click();

    // 9. Assert that the modal is successfully hidden
    await expect(wipModal).toBeHidden();
  });
});
