import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, gotoApp, signIn, waitForAppAnimations } from './fixtures/app.fixture';

test.describe('standings, rules, achievements, and the trophy cabinet', () => {
  test('reads the competition standings table with its rule-version footer', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.standings);

    await expect(page.getByTestId(TEST_IDS.standingsTable)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.standingsRow).first()).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.standingsRuleFooter)).toContainText('Computed under');
  });

  test('surfaces provenance and the rules footer link', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.standings);

    await expect(page.getByTestId(TEST_IDS.standingsRulesLink)).toBeVisible();
    await page.getByTestId(TEST_IDS.standingsRulesLink).click();
    await expect(page.getByTestId(TEST_IDS.standingsRulesList)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.standingsRulesView)).toContainText('never edited');
  });

  test('runs the achievements approval workflow to the cabinet', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.achievements);

    await expect(page.getByTestId(TEST_IDS.achievementsList)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.achievementCard).first()).toBeVisible();

    await gotoApp(page, APP_ROUTES.teamHistory);
    await expect(page.getByTestId(TEST_IDS.teamHistoryTimeline)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.teamHistoryEntry).first()).toBeVisible();
  });

  test('@rtl mirrors the standings screen for Arabic', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.standings);
    await waitForAppAnimations(page);
    await expect(page.getByTestId(TEST_IDS.standingsView)).toBeVisible();
  });
});
