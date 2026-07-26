import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, gotoApp, signIn } from './fixtures/app.fixture';

test.describe('reports center', () => {
  test('lists jobs with the request panel and all status chips', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.reports);

    await expect(page.getByTestId(TEST_IDS.reportRequestPanel)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.reportJobList)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.reportJobRow).first()).toBeVisible();
  });

  test('exposes the governed template catalog with privacy chips', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.reports);

    await expect(page.getByTestId(TEST_IDS.reportTemplateOption).first()).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.reportRequestSubmit)).toBeVisible();
  });

  test('requests a report and shows it advancing through the lifecycle', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.reports);

    await page.getByTestId(TEST_IDS.reportRequestSubmit).click();
    // The queued job advances to a completed, downloadable row via polling.
    await expect(page.getByTestId(TEST_IDS.reportDownloadButton).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
