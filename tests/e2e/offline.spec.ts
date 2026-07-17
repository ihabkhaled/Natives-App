import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, gotoApp, login, setOffline } from './fixtures/app.fixture';

test.describe('offline and failure paths', () => {
  test.afterEach(async ({ page }) => {
    await setOffline(page, false);
  });

  test('raises the global offline banner and clears it on reconnect', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.welcome);
    await expect(page.getByTestId(TEST_IDS.offlineBanner)).toBeHidden();

    await setOffline(page, true);
    await expect(page.getByTestId(TEST_IDS.offlineBanner)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.offlineBanner)).toHaveText('You are offline');

    await setOffline(page, false);
    await expect(page.getByTestId(TEST_IDS.offlineBanner)).toBeHidden();
  });

  test('keeps the health card operational while the mock backend is healthy', async ({ page }) => {
    // Backend-failure rendering is proven in tests/integration/health-error-state
    // instead: mock mode is served by the MSW service worker, which answers
    // before Playwright's network interception can inject a failure.
    await login(page);

    await expect(page.getByTestId(TEST_IDS.healthCard)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.healthStatus)).toContainText('Operational');
  });

  test('reports connectivity loss on the settings screen', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await expect(page.getByTestId(TEST_IDS.settingsNetworkStatus)).toContainText('Online');

    await setOffline(page, true);

    await expect(page.getByTestId(TEST_IDS.settingsNetworkStatus)).toContainText('Offline');
  });
});
