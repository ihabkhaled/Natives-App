import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, gotoApp, signIn } from './fixtures/app.fixture';

test.describe('team and player analytics', () => {
  test('renders the governed series chart with its accessible data table', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.analytics);

    await expect(page.getByTestId(TEST_IDS.analyticsSeriesChart)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.analyticsSeriesChart).getByRole('img')).toHaveAttribute(
      'aria-label',
      /.+/u,
    );
    await expect(page.getByTestId(TEST_IDS.chartDataTable)).toBeAttached();
  });

  test('presents the cohort comparison and freshness card', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.analytics);

    await expect(page.getByTestId(TEST_IDS.analyticsCohortPanel)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.analyticsFreshnessCard)).toBeVisible();
  });

  test('opens a player’s analytics from the team screen', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, `${APP_ROUTES.analytics}/players/membership-natives-1`);

    await expect(page.getByTestId(TEST_IDS.playerAnalyticsView)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.playerAnalyticsBack)).toBeVisible();
  });
});
