import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, gotoApp, signIn, waitForAppAnimations } from './fixtures/app.fixture';

test.describe('external training and points', () => {
  test('logs a session honestly: candidate points, never a guessed number', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.training);

    const composer = page.getByTestId(TEST_IDS.trainingComposer);
    await expect(composer).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.trainingCandidatePoints)).toContainText('Pending');
    await expect(page.getByTestId(TEST_IDS.trainingEvidencePanel)).toContainText(
      'never leaves the upload service',
    );
  });

  test('confirms a pending buddy credit end to end', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.training);

    const section = page.getByTestId(TEST_IDS.trainingBuddySection);
    await expect(section).toBeVisible();
    await expect(section.getByText('1 pending')).toBeVisible();

    await section.getByTestId(TEST_IDS.trainingBuddyConfirm).click();

    await expect(section.getByTestId(TEST_IDS.trainingBuddyConfirm)).toHaveCount(0);
    await expect(section.getByText('Confirmed').first()).toBeVisible();
  });

  test('lists the member own claims with their review state', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.training);

    await expect(page.getByTestId(TEST_IDS.trainingSubmissionList)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.trainingSubmissionCard).first()).toBeVisible();
  });

  test('opens one claim with its evidence, buddies, and history', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.training);
    await page.getByTestId(TEST_IDS.trainingSubmissionOpen).first().click();

    await expect(page.getByTestId(TEST_IDS.trainingHistoryList)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.trainingWorkflowBar)).toBeVisible();
  });

  test('shows the reviewer queue with its advisory signals', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.trainingReview);

    await expect(page.getByTestId(TEST_IDS.trainingReviewQueue)).toBeVisible();
    await page.getByTestId(TEST_IDS.trainingSubmissionOpen).first().click();
    await expect(page.getByTestId(TEST_IDS.trainingReviewSignals)).toContainText(
      'Advisory prompts only',
    );
  });

  test('keeps a zero-contribution member visible on the leaderboard', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.leaderboard);

    await expect(page.getByTestId(TEST_IDS.leaderboardTable)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.leaderboardRow)).toHaveCount(4);
    await expect(page.locator('.app-leaderboard-table__row--zero')).toHaveCount(1);
    await expect(page.getByTestId(TEST_IDS.leaderboardTieRule)).toContainText(
      'stay on the board at 0',
    );
  });

  test('explains one rank from the server contributions', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.leaderboard);
    await page.getByTestId(TEST_IDS.leaderboardExplainToggle).first().click();

    await expect(page.getByTestId(TEST_IDS.leaderboardExplainPanel)).toContainText(
      'never recalculates',
    );
  });

  test('shows awards, reversals, and adjustments as separate ledger entries', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.points);

    await expect(page.getByTestId(TEST_IDS.pointsLedger)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.pointsLedgerEntry)).toHaveCount(4);
    await expect(page.getByTestId(TEST_IDS.pointsBadge)).toHaveCount(2);
    await waitForAppAnimations(page);
  });

  test('never shows the unresolved legacy badge tier', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.points);

    await expect(page.getByTestId(TEST_IDS.pointsBadgeList)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.pointsHistoryView)).not.toContainText('649');
  });
});
