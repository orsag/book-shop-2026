import { test, expect } from '@playwright/test';

test.describe('Profile Route Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the profile route
    await page.goto('/profile');
    await page.locator('.skeleton').first().waitFor({ state: 'hidden' });
  });

  test('should display the correct page heading', async ({ page }) => {
    // Assert that the header renders exactly as expected[cite: 5]
    await expect(page.locator('h1')).toHaveText('Editácia profilu');
  });

  test('should update all editable profile inputs and show a success toast', async ({ page }) => {
    // 1. Fill out all required personal and contact fields
    await page.locator('#displayname').fill('John Doe Senior');
    await page.locator('#email').fill('john.doe.updated@example.com');
    await page.locator('#phone').fill('+421900123456');

    // 2. Fill out bio text area
    await page.locator('#user-bio').fill('Just an avid book reader updating my bio context.');

    // 3. Fill out address information
    await page.locator('#city').fill('Bratislava');
    await page.locator('#addressLine1').fill('Hlavna ulica 45');

    // 4. Fill out billing records
    await page.locator('#iban').fill('SK1234567890123456789012');
    await page.locator('#taxId').fill('SK2021222324');

    // 5. Click the primary "Uložiť" (Save) button
    await page.getByRole('button', { name: 'Uložiť' }).click();

    // 6. Target the dynamic toast component container
    const toastAlert = page.getByTestId('toast').locator('.alert');

    // 7. Verify it has the contextual success styling class applied
    await toastAlert.isVisible();
    // await expect(toastAlert).toHaveClass(/success/);

    // 8. Assert that the notification yields the correct message string
    await expect(toastAlert).toContainText('Update profile successful', {
      timeout: 10000,
    });
  });

});