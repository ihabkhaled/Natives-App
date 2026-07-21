import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import {
  APP_ROUTES,
  expectPresentedPage,
  gotoApp,
  setOffline,
  signIn,
} from './fixtures/app.fixture';

test.describe('matches and the live scoreboard', () => {
  test('lists the team matches with both entry points', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matches);
    await expectPresentedPage(page, TEST_IDS.matchesPage);

    await expect(page.getByTestId(TEST_IDS.matchCard)).toHaveCount(2);
  });

  test('shows the authoritative score and the caps the rule set publishes', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchScoreboard);
    await expectPresentedPage(page, TEST_IDS.scoreboardPage);

    await expect(page.getByTestId(TEST_IDS.scoreboardOurScore)).toHaveText('8');
    await expect(page.getByTestId(TEST_IDS.scoreboardTheirScore)).toHaveText('6');
    await expect(page.getByTestId(TEST_IDS.scoreboardRules)).toContainText('Game to');
    await expect(page.getByTestId(TEST_IDS.scorekeeperQueueBadge)).toContainText('Synced');
  });

  test('records a point and leaves nothing waiting to sync', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchScoreboard);
    await expectPresentedPage(page, TEST_IDS.scoreboardPage);

    await page.getByTestId(TEST_IDS.scoreboardPointUs).click();

    await expect(page.getByTestId(TEST_IDS.scoreboardOurScore)).toHaveText('9');
    await expect(page.getByTestId(TEST_IDS.scorekeeperQueueBadge)).toContainText('Synced');
  });

  test('queues a point offline and replays it on reconnect, scoring it once', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchScoreboard);
    await expectPresentedPage(page, TEST_IDS.scoreboardPage);

    await setOffline(page, true);
    await expect(page.getByTestId(TEST_IDS.scorekeeperQueueBadge)).toContainText('Offline');
    await page.getByTestId(TEST_IDS.scoreboardPointUs).click();
    await expect(page.getByTestId(TEST_IDS.scorekeeperQueueRow)).toHaveCount(1);

    await setOffline(page, false);

    await expect(page.getByTestId(TEST_IDS.scorekeeperQueueRow)).toHaveCount(0);
    await expect(page.getByTestId(TEST_IDS.scoreboardOurScore)).toHaveText('9');
  });

  test('blocks finalizing a live match and says which condition is unmet', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchScoreboard);
    await expectPresentedPage(page, TEST_IDS.scoreboardPage);

    await expect(page.getByTestId(TEST_IDS.scoreboardFinalizeBlocked)).toContainText(
      'available once the match is completed',
    );
    // Ionic marks a disabled ion-button with aria-disabled; the native
    // :disabled pseudo-state does not apply to a custom element.
    await expect(page.getByTestId(TEST_IDS.scoreboardFinalizeAction)).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  test('undoes a point through a visible compensating correction', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchScoreboard);
    await expectPresentedPage(page, TEST_IDS.scoreboardPage);

    // The stream has to be on screen before the correction can be counted
    // against it; otherwise the baseline is taken from an empty timeline.
    await expect(page.getByTestId(TEST_IDS.scoreboardTimelineRow)).toHaveCount(2);
    await page.getByTestId(TEST_IDS.scoreboardUndo).click();
    await page
      .getByTestId(TEST_IDS.scoreboardUndoReason)
      .locator('textarea')
      .fill('mis-tap on the sideline');
    await page.getByTestId(TEST_IDS.scoreboardUndoConfirm).click();

    // The original point is still there; the correction is appended beside it.
    await expect(page.getByTestId(TEST_IDS.scoreboardTimelineRow)).toHaveCount(3);
    await expect(page.getByTestId(TEST_IDS.scoreboardTimeline)).toContainText('Correction');
  });
});

test.describe('match statistics', () => {
  test('shows every rostered player, including one with no contribution', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchStatistics);
    await expectPresentedPage(page, TEST_IDS.matchStatsPage);

    await expect(page.getByTestId(TEST_IDS.matchStatsPlayerRow)).toHaveCount(4);
    await expect(page.getByTestId(TEST_IDS.matchStatsPlayers)).toContainText(
      'No recorded contribution',
    );
    await expect(page.getByTestId(TEST_IDS.matchStatsPlayers)).toContainText('Not enough data');
  });

  test('marks video analysis as an unshipped backend capability', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchStatistics);
    await expectPresentedPage(page, TEST_IDS.matchStatsPage);

    await expect(page.getByTestId(TEST_IDS.matchStatsVideo)).toContainText(
      'Video analysis is not available yet',
    );
  });

  test('offers the chart numbers as a real table', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchStatistics);
    await expectPresentedPage(page, TEST_IDS.matchStatsPage);

    await expect(page.getByTestId(TEST_IDS.chartDataTable)).toBeAttached();
  });
});
