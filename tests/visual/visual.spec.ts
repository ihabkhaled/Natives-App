import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, gotoApp, signIn, waitForAppAnimations } from '../e2e/fixtures/app.fixture';

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
    await signIn(page);
    await expect(page.getByTestId(TEST_IDS.homePage)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.dashboardView)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('home-light.png', { fullPage: true });
  });

  test('practice calendar (light)', async ({ page }) => {
    await signIn(page);
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

  test('member directory (light)', async ({ page }) => {
    await signIn(page);
    await page.getByTestId(`${TEST_IDS.primaryNavItem}-members`).click();
    await expect(page.getByTestId(TEST_IDS.membersList)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('members-directory-light.png', { fullPage: true });
  });

  test('member profile (light)', async ({ page }) => {
    await signIn(page);
    await page.getByTestId(`${TEST_IDS.primaryNavItem}-members`).click();
    await expect(page.getByTestId(TEST_IDS.membersList)).toBeVisible();
    await page.getByRole('button', { name: 'Omar Hassan' }).click();
    await expect(page.getByTestId(TEST_IDS.memberProfileFields)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('member-profile-light.png', { fullPage: true });
  });

  test('assessment workspace (light)', async ({ page }) => {
    await signIn(page);
    await page.getByTestId(`${TEST_IDS.primaryNavItem}-assessments`).click();
    await expect(page.getByTestId(TEST_IDS.assessmentsList)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('assessments-workspace-light.png', { fullPage: true });
  });

  test('assessment entry grid (light)', async ({ page }) => {
    await signIn(page);
    await page.getByTestId(`${TEST_IDS.primaryNavItem}-assessments`).click();
    await expect(page.getByTestId(TEST_IDS.assessmentsList)).toBeVisible();
    await page.getByTestId(TEST_IDS.assessmentSummaryCard).first().getByText('Open').click();
    await expect(page.getByTestId(TEST_IDS.assessmentMetricGrid)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('assessment-entry-light.png', { fullPage: true });
  });

  test('player performance charts (light)', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.performance);
    await expect(page.getByTestId(TEST_IDS.performanceTrendChart)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('performance-light.png', { fullPage: true });
  });

  test('external training workspace (light)', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.training);
    await expect(page.getByTestId(TEST_IDS.trainingComposer)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('external-training-light.png', { fullPage: true });
  });

  test('training review queue (light)', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.trainingReview);
    await expect(page.getByTestId(TEST_IDS.trainingReviewQueue)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('training-review-light.png', { fullPage: true });
  });

  test('leaderboard standings (light)', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.leaderboard);
    await expect(page.getByTestId(TEST_IDS.leaderboardTable)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('leaderboard-light.png', { fullPage: true });
  });

  test('points ledger and badges (light)', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.points);
    await expect(page.getByTestId(TEST_IDS.pointsLedger)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('points-history-light.png', { fullPage: true });
  });

  test('competition list (light)', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.competitions);
    await expect(page.getByTestId(TEST_IDS.competitionsList)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('competitions-light.png', { fullPage: true });
  });

  test('squad workspace (light)', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, `${APP_ROUTES.squads}/b0000000-0000-4000-8000-000000000001`);
    await expect(page.getByTestId(TEST_IDS.squadEligibilityPanel)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('squad-workspace-light.png', { fullPage: true });
  });

  test('roster workspace (light)', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, `${APP_ROUTES.rosters}/11000000-0000-4000-8000-000000000001`);
    await expect(page.getByTestId(TEST_IDS.rosterEntriesPanel)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('roster-workspace-light.png', { fullPage: true });
  });

  test('tryout registration (light)', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.tryoutRegistration);
    await expect(page.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('tryout-registration-light.png', { fullPage: true });
  });

  test('tryout workspace (light)', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.tryouts);
    await page.getByTestId(TEST_IDS.tryoutOpen).first().click();
    await expect(page.getByTestId(TEST_IDS.tryoutCandidateList)).toBeVisible();
    await waitForAppAnimations(page);
    await expect(page).toHaveScreenshot('tryout-workspace-light.png', { fullPage: true });
  });
});
