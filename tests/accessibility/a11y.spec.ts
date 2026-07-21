import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import {
  MOCK_CREDENTIALS,
  MOCK_INVITATION,
  MOCK_PERSONA_EMAILS,
  MOCK_RESET,
} from '@/tests/msw/mock-data.constants';
import { MOCK_NOTIFICATIONS } from '@/tests/msw/notifications.fixture';

import {
  APP_ROUTES,
  fillIonInput,
  gotoApp,
  setOffline,
  signIn,
  waitForAppAnimations,
} from '../e2e/fixtures/app.fixture';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function analyze(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
}

test.describe('accessibility (WCAG 2.2 AA)', () => {
  test('welcome screen has no violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.welcome);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('login screen has no violations, including its error state', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.login);
    expect((await analyze(page)).violations).toEqual([]);

    await fillIonInput(page, TEST_IDS.loginEmailInput, 'not-an-email');
    await page.getByTestId(TEST_IDS.loginSubmitButton).click();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();

    expect((await analyze(page)).violations).toEqual([]);
  });

  test('settings screen has no violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('forgot-password screen has no violations', async ({ page }) => {
    await gotoApp(page, '/forgot-password');
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('reset-password screen has no violations', async ({ page }) => {
    await gotoApp(page, `/reset-password?token=${MOCK_RESET.validToken}`);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('invitation acceptance screen has no violations', async ({ page }) => {
    await gotoApp(page, `/accept-invitation?token=${MOCK_INVITATION.validToken}`);
    await expect(page.getByTestId(TEST_IDS.acceptInvitationEmail)).toBeVisible();
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('session management screen has no violations', async ({ page }) => {
    await signIn(page);
    await expect(page.getByTestId(TEST_IDS.homePage)).toBeVisible();
    await page.getByTestId(TEST_IDS.homeSessionsLink).click();
    await expect(page.getByTestId(TEST_IDS.sessionsPage)).toBeVisible();
    // Let the route transition settle so axe audits the resting danger buttons,
    // not their lighter mid-fade opacity.
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('workbench screen has no violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.workbench);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('authenticated home screen has no violations', async ({ page }) => {
    await signIn(page);
    await expect(page.getByTestId(TEST_IDS.homePage)).toBeVisible();
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('practice calendar and session detail have no violations', async ({ page }) => {
    await signIn(page);
    await expect(page.getByTestId(TEST_IDS.homePage)).toBeVisible();
    await page.getByTestId(`${TEST_IDS.primaryNavItem}-practice-calendar`).click();
    await expect(page.getByTestId(TEST_IDS.practiceSessionCard).first()).toBeVisible();

    expect((await analyze(page)).violations).toEqual([]);

    await page
      .getByTestId(TEST_IDS.practiceSessionCard)
      .filter({ hasText: 'Practice' })
      .first()
      .click();
    await expect(page.getByTestId(TEST_IDS.rsvpControl)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('member directory and profile have no violations', async ({ page }) => {
    await signIn(page);
    await expect(page.getByTestId(TEST_IDS.homePage)).toBeVisible();
    await page.getByTestId(`${TEST_IDS.primaryNavItem}-members`).click();
    await expect(page.getByTestId(TEST_IDS.membersList)).toBeVisible();

    expect((await analyze(page)).violations).toEqual([]);

    await page.getByRole('button', { name: 'Omar Hassan' }).click();
    await expect(page.getByTestId(TEST_IDS.memberProfileFields)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('assessment workspace and entry screens have no violations', async ({ page }) => {
    await signIn(page);
    await page.getByTestId(`${TEST_IDS.primaryNavItem}-assessments`).click();
    await expect(page.getByTestId(TEST_IDS.assessmentsList)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);

    await page.getByTestId(TEST_IDS.assessmentSummaryCard).first().getByText('Open').click();
    await expect(page.getByTestId(TEST_IDS.assessmentMetricGrid)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('player performance charts have no violations and keep their data tables', async ({
    page,
  }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.performance);
    await expect(page.getByTestId(TEST_IDS.performanceTrendChart)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);

    await expect(page.getByTestId(TEST_IDS.chartDataTable)).toHaveCount(2);
    await page.getByTestId(TEST_IDS.chartDataToggle).first().click();
    await expect(page.getByTestId(TEST_IDS.chartDataTable).first()).toBeVisible();
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('dark palette has no contrast violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await page
      .getByTestId(TEST_IDS.settingsThemeSelect)
      .locator('ion-segment-button[value="dark"]')
      .click();
    await expect(page.locator('html')).toHaveClass(/ion-palette-dark/u);

    expect((await analyze(page)).violations).toEqual([]);
  });

  test('Arabic RTL layout has no violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await page
      .getByTestId(TEST_IDS.settingsLocaleSelect)
      .locator('ion-segment-button[value="ar"]')
      .click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    expect((await analyze(page)).violations).toEqual([]);
  });

  test('interactive targets meet the 44px minimum', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.login);

    const submit = page.getByTestId(TEST_IDS.loginSubmitButton);
    const box = await submit.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});

test.describe('external training and points accessibility', () => {
  test('external training workspace has no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.training);
    await expect(page.getByTestId(TEST_IDS.trainingComposer)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('training review queue has no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.trainingReview);
    await expect(page.getByTestId(TEST_IDS.trainingReviewQueue)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('leaderboard table and its rank explanation have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.leaderboard);
    await expect(page.getByTestId(TEST_IDS.leaderboardTable)).toBeVisible();
    await page.getByTestId(TEST_IDS.leaderboardExplainToggle).first().click();
    await expect(page.getByTestId(TEST_IDS.leaderboardExplainPanel)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('points ledger, badges, and the category chart have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.points);
    await expect(page.getByTestId(TEST_IDS.pointsLedger)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });
});

test.describe('competitions, squads, and tryouts accessibility', () => {
  test('competition list and detail have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.competitions);
    await expect(page.getByTestId(TEST_IDS.competitionsList)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);

    await page.getByTestId(TEST_IDS.competitionOpen).first().click();
    await expect(page.getByTestId(TEST_IDS.competitionSummary)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('squad list and workspace have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.squads);
    await expect(page.getByTestId(TEST_IDS.squadsList)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);

    await page.getByTestId(TEST_IDS.squadOpen).first().click();
    await expect(page.getByTestId(TEST_IDS.squadEligibilityPanel)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('roster list and workspace have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.rosters);
    await expect(page.getByTestId(TEST_IDS.rostersList)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);

    await page.getByTestId(TEST_IDS.rosterOpen).first().click();
    await expect(page.getByTestId(TEST_IDS.rosterEntriesPanel)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('the public tryout registration form has no violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.tryoutRegistration);
    await expect(page.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('the tryout workspace and its restricted panels have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.tryouts);
    await page.getByTestId(TEST_IDS.tryoutOpen).first().click();
    await expect(page.getByTestId(TEST_IDS.tryoutCandidateList)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);

    await page.getByTestId(TEST_IDS.tryoutCandidateOpen).first().click();
    await expect(page.getByTestId(TEST_IDS.tryoutCandidatePanel)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });
});

test.describe('notifications accessibility', () => {
  test('the inbox and its filters have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.notifications);
    await expect(page.getByTestId(TEST_IDS.notificationsView)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('the app bar notification popover has no violations', async ({ page }) => {
    await signIn(page);
    await expect(page.getByTestId(TEST_IDS.homePage)).toBeVisible();
    await page.getByTestId(TEST_IDS.appBarNotifications).click();
    await expect(page.getByTestId(TEST_IDS.appBarNotificationsPanel)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('the preference matrix and quiet hours have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.notificationPreferences);
    await expect(page.getByTestId(TEST_IDS.notificationPrefsMatrix)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('the designed forbidden arrival state has no violations', async ({ page }) => {
    await signIn(page, {
      email: MOCK_PERSONA_EMAILS.member,
      password: MOCK_CREDENTIALS.password,
    });
    await gotoApp(page, `/notifications/open/${MOCK_NOTIFICATIONS.forbiddenAttendanceId}`);
    await expect(page.getByTestId(TEST_IDS.notificationLinkForbidden)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });
});

test.describe('admin console accessibility', () => {
  test('the admin hub has no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.admin);
    await expect(page.getByTestId(TEST_IDS.adminHubView)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('team settings and its scheduling form have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminSettings);
    await expect(page.getByTestId(TEST_IDS.adminEffectivePanel)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('role assignment has no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminRoles);
    await expect(page.getByTestId(TEST_IDS.adminRolesMemberSelect)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('rule governance and its dry-run panel have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminRules);
    await expect(page.getByTestId(TEST_IDS.adminRuleRow).first()).toBeVisible();
    await page.getByTestId(TEST_IDS.adminRuleOpen).first().click();
    await expect(page.getByTestId(TEST_IDS.adminRulePanel)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('the operations centre has no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminOperations);
    await expect(page.getByTestId(TEST_IDS.adminOutboxPanel)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });
});

test.describe('matches accessibility', () => {
  test('the match list has no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matches);
    await expect(page.getByTestId(TEST_IDS.matchesList)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('the live scoreboard and its scorekeeper controls have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchScoreboard);
    await expect(page.getByTestId(TEST_IDS.scoreboardScore)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('the offline sync panel and its conflict block have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchScoreboard);
    await expect(page.getByTestId(TEST_IDS.scoreboardScore)).toBeVisible();
    await setOffline(page, true);
    await page.getByTestId(TEST_IDS.scoreboardPointUs).click();
    await expect(page.getByTestId(TEST_IDS.scorekeeperQueueRow)).toHaveCount(1);
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
    await setOffline(page, false);
  });

  test('the undo correction form has no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchScoreboard);
    await page.getByTestId(TEST_IDS.scoreboardUndo).click();
    await expect(page.getByTestId(TEST_IDS.scoreboardUndoReason)).toBeVisible();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('the statistics table and its chart alternative have no violations', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.matchStatistics);
    await expect(page.getByTestId(TEST_IDS.matchStatsPlayers)).toBeVisible();
    await page.getByTestId(TEST_IDS.chartDataToggle).click();
    await waitForAppAnimations(page);
    expect((await analyze(page)).violations).toEqual([]);
  });
});
