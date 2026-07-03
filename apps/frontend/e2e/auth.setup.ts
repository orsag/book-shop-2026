import { expect, test as setup } from '@playwright/test';

setup('Authenticate and save storage state', async ({ page }) => {
  const TEST_USER = 'bossman';
  const PATH = './e2e/.auth.json';

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/login');

  // Fill Login Form and Click Login
  await page.getByPlaceholder('User name').fill(TEST_USER);
  await page.getByRole('button', { name: 'login' }).click();

  // Wait for Successful Login & Page Ready
  await page.waitForURL('/', { timeout: 10000 });
  const dashboardElementGrid = page.getByTestId('main-layout-list');
  await expect(dashboardElementGrid).toBeVisible({ timeout: 20000 });

  // Fetch the raw text content from the target node
  const languageSpan = page.locator('span[title="language"]');
  const currentLang = (await languageSpan.innerText()).trim();

  // Execute conditional interaction steps based on the string value
  if (currentLang === 'EN') {
    const languageBtn = page.getByTestId('language-btn');
    await languageBtn.click();
    await expect(languageSpan).toHaveText('SK');
  } else {
    // If languageSpan contains 'SK', do nothing and verify it stays matching
    await expect(languageSpan).toHaveText('SK');
  }

  // Save Authentication State
  await page.context().storageState({ path: PATH });
});
