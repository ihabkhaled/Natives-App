import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, gotoApp } from './fixtures/app.fixture';

test.describe('settings', () => {
  test('reports mock API mode and the runtime platform', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);

    await expect(page.getByTestId(TEST_IDS.settingsApiMode)).toContainText('Mock');
    await expect(page.getByTestId(TEST_IDS.settingsRuntimePlatform)).toContainText('Web');
    await expect(page.getByTestId(TEST_IDS.settingsNetworkStatus)).toContainText('Online');
  });

  test('switches to the dark palette and keeps it across a reload', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);

    await page
      .getByTestId(TEST_IDS.settingsThemeSelect)
      .locator('ion-segment-button[value="dark"]')
      .click();

    await expect(page.locator('html')).toHaveClass(/ion-palette-dark/u);

    await page.reload();
    await expect(page.getByTestId(TEST_IDS.settingsPage)).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/ion-palette-dark/u);
  });

  test('switches to the light palette', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);

    await page
      .getByTestId(TEST_IDS.settingsThemeSelect)
      .locator('ion-segment-button[value="light"]')
      .click();

    await expect(page.locator('html')).not.toHaveClass(/ion-palette-dark/u);
  });

  test('@rtl switches to Arabic, flips direction, and persists the choice', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');

    await page
      .getByTestId(TEST_IDS.settingsLocaleSelect)
      .locator('ion-segment-button[value="ar"]')
      .click();

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.getByTestId(TEST_IDS.settingsPage)).toContainText('الإعدادات');

    await page.reload();
    await expect(page.getByTestId(TEST_IDS.settingsPage)).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('@rtl renders the Arabic login screen right-to-left', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await page
      .getByTestId(TEST_IDS.settingsLocaleSelect)
      .locator('ion-segment-button[value="ar"]')
      .click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await gotoApp(page, APP_ROUTES.login);

    await expect(page.getByTestId(TEST_IDS.loginPage)).toContainText('تسجيل الدخول');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});
