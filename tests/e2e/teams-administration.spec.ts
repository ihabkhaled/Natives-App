import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { APP_ROUTES, expectPresentedPage, gotoApp, login } from './fixtures/app.fixture';

function personaLogin(email: string): { email: string; password: string } {
  return { email, password: MOCK_CREDENTIALS.password };
}

const TEAMS_NAV_ITEM = `${TEST_IDS.primaryNavItem}-admin-teams`;

/**
 * Teams and seasons are the surfaces where a platform grant and a team grant
 * are easy to confuse. These journeys pin the difference: a super administrator
 * browses and creates teams, a team administrator is refused both, and both can
 * still run the lifecycle their own scope allows.
 */
test.describe('team and season administration', () => {
  test('a super administrator browses every team with its lifecycle controls', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.admin));
    await expectPresentedPage(page, TEST_IDS.homePage);

    await page.getByTestId(TEAMS_NAV_ITEM).click();

    await expectPresentedPage(page, TEST_IDS.teamsPage);
    await expect(page.getByTestId(TEST_IDS.teamsCreateButton)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.teamsRow)).toHaveCount(2);
  });

  test('only the transitions that are legal from a team state are offered', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.admin));
    await gotoApp(page, APP_ROUTES.adminTeams);
    await expectPresentedPage(page, TEST_IDS.teamsPage);

    // Active: it can be disabled or archived, never "activated" again.
    await expect(page.getByTestId(`${TEST_IDS.teamsRow}-deactivate-team-natives`)).toBeVisible();
    await expect(page.getByTestId(`${TEST_IDS.teamsRow}-activate-team-natives`)).toHaveCount(0);
    // Disabled: it can be activated or archived.
    await expect(page.getByTestId(`${TEST_IDS.teamsRow}-activate-team-reserve`)).toBeVisible();
    // `remove` is reachable only from archived; neither row offers it.
    await expect(page.getByTestId(`${TEST_IDS.teamsRow}-remove-team-natives`)).toHaveCount(0);
  });

  test('creating a team opens a form whose slug is writable', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.admin));
    await gotoApp(page, APP_ROUTES.adminTeams);
    await expectPresentedPage(page, TEST_IDS.teamsPage);

    await page.getByTestId(TEST_IDS.teamsCreateButton).click();

    await expect(page.getByTestId(TEST_IDS.teamEditorForm)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.teamEditorSlug).locator('input')).toBeEnabled();
  });

  test('editing an existing team locks its slug, which is its permanent identity', async ({
    page,
  }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.admin));
    await gotoApp(page, APP_ROUTES.adminTeams);
    await expectPresentedPage(page, TEST_IDS.teamsPage);

    await page.getByTestId(`${TEST_IDS.teamsRow}-edit-team-natives`).click();

    await expect(page.getByTestId(TEST_IDS.teamEditorForm)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.teamEditorSlug).locator('input')).toBeDisabled();
  });

  test('a team administrator is refused the platform teams surface entirely', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.teamAdmin));
    await expectPresentedPage(page, TEST_IDS.homePage);

    // Browsing every team is a PLATFORM grant (team.browse.all): the
    // backend answers 403, so the shell must not offer the destination at all.
    await expect(page.getByTestId(TEAMS_NAV_ITEM)).toHaveCount(0);

    await gotoApp(page, APP_ROUTES.adminTeams);

    await expect(page.getByTestId(TEST_IDS.guardForbidden)).toBeVisible();
  });

  test('a team administrator manages their own team seasons', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.teamAdmin));
    await gotoApp(page, APP_ROUTES.adminSeasons);

    await expectPresentedPage(page, TEST_IDS.seasonsPage);
    await expect(page.getByTestId(TEST_IDS.seasonsRow)).toHaveCount(2);
    await expect(page.getByTestId(TEST_IDS.seasonsCreateButton)).toBeVisible();
  });

  test('the season editor offers both dates as real pickers', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.teamAdmin));
    await gotoApp(page, APP_ROUTES.adminSeasons);
    await expectPresentedPage(page, TEST_IDS.seasonsPage);

    await page.getByTestId(TEST_IDS.seasonsCreateButton).click();

    await expect(page.getByTestId(TEST_IDS.seasonEditorStartsOn)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.seasonEditorEndsOn)).toBeVisible();
    // Neither shows a date the form does not hold.
    await expect(page.getByTestId(TEST_IDS.seasonEditorStartsOn)).toContainText('Select a date');
  });

  test('the permissions matrix answers "which bundle grants this"', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.teamAdmin));
    await gotoApp(page, APP_ROUTES.adminPermissions);

    await expectPresentedPage(page, TEST_IDS.permissionsMatrixPage);
    await expect(page.getByTestId(TEST_IDS.permissionsMatrixTable)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.permissionsMatrixRow)).toHaveCount(4);
    await expect(page.getByText('Team administrator')).toBeVisible();
    // The sentinel plus one option per distinct area in the seeded catalog.
    await expect(
      page.getByTestId(TEST_IDS.permissionsMatrixAreaFilter).locator('ion-select-option'),
    ).toHaveCount(3);
  });

  test('a member never reaches the matrix', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await expectPresentedPage(page, TEST_IDS.homePage);

    await gotoApp(page, APP_ROUTES.adminPermissions);

    await expect(page.getByTestId(TEST_IDS.guardForbidden)).toBeVisible();
  });
});
