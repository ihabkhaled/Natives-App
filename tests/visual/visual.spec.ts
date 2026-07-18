import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, gotoApp, login, waitForAppAnimations } from '../e2e/fixtures/app.fixture';

/** Deterministic screenshots: animations disabled by the config expectation. */
test.describe('visual regression', () => {
  test('welcome screen (light)', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.welcome);
    await expect(page.getByTestId(TEST_IDS.welcomePage)).toBeVisible();
    await expect(page).toHaveScreenshot('welcome-light.png', { fullPage: true });
  });

  test('login screen (light)', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.login);
    await expect(page.getByTestId(TEST_IDS.loginPage)).toBeVisible();
    await expect(page).toHaveScreenshot('login-light.png', { fullPage: true });
  });

  test('authenticated home screen (light)', async ({ page }) => {
    await login(page);
    await expect(page.getByTestId(TEST_IDS.homePage)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.dashboardView)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('home-light.png', { fullPage: true });
  });

  test('practice calendar (light)', async ({ page }) => {
    await login(page);
    await page.getByTestId(`${TEST_IDS.primaryNavItem}-practice-calendar`).click();
    await expect(page.getByTestId(TEST_IDS.practiceSessionCard).first()).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('practice-calendar-light.png', { fullPage: true });
  });

  test('settings screen (dark)', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await page
      .getByTestId(TEST_IDS.settingsThemeSelect)
      .locator('ion-segment-button[value="dark"]')
      .click();
    await expect(page.locator('html')).toHaveClass(/ion-palette-dark/u);
    await expect(page).toHaveScreenshot('settings-dark.png', { fullPage: true });
  });

  test('settings screen (Arabic RTL)', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await page
      .getByTestId(TEST_IDS.settingsLocaleSelect)
      .locator('ion-segment-button[value="ar"]')
      .click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page).toHaveScreenshot('settings-rtl.png', { fullPage: true });
  });

  test('workbench states', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.workbench);
    const states = page.getByTestId(TEST_IDS.workbenchStates);
    await expect(states).toBeVisible();
    await expect(states).toHaveScreenshot('workbench-states.png');
  });
});
