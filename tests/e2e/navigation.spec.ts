import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, expectPresentedPage, gotoApp } from './fixtures/app.fixture';

test.describe('public navigation', () => {
  test('redirects the root path to the welcome screen', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.root);

    await expect(page.getByTestId(TEST_IDS.welcomePage)).toBeVisible();
    await expect(page).toHaveURL(/\/welcome$/u);
  });

  test('moves from welcome to login through the call to action', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.welcome);

    await page.getByTestId(TEST_IDS.welcomeLoginCta).click();

    await expectPresentedPage(page, TEST_IDS.loginPage);
    await expect(page).toHaveURL(/\/login$/u);
  });

  test('serves settings and the workbench without a session', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await expect(page.getByTestId(TEST_IDS.settingsPage)).toBeVisible();

    await gotoApp(page, APP_ROUTES.workbench);
    await expect(page.getByTestId(TEST_IDS.workbenchPage)).toBeVisible();
  });

  test('renders the not-found screen for an unknown route', async ({ page }) => {
    await gotoApp(page, '/this-route-does-not-exist');

    await expect(page.getByTestId(TEST_IDS.notFoundPage)).toBeVisible();
    await page.getByTestId(TEST_IDS.notFoundHomeLink).click();
    await expect(page).toHaveURL(/\/welcome$/u);
    await expectPresentedPage(page, TEST_IDS.welcomePage);
  });

  test('sends an anonymous visitor from the protected home route to login', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.home);

    await expect(page.getByTestId(TEST_IDS.loginPage)).toBeVisible();
    await expect(page).toHaveURL(/\/login$/u);
  });
});
