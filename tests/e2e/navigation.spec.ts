import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { APP_ROUTES, expectPresentedPage, gotoApp, signIn } from './fixtures/app.fixture';

test.describe('public navigation', () => {
  test('serves the marketing landing page at the root path', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.root);

    // `/` is the site's front door, not a redirect to /welcome — /welcome is
    // the lightweight signed-out app entry kept alive for old deep links.
    await expect(page.getByTestId(TEST_IDS.landingPage)).toBeVisible();
    await expect(page).toHaveURL(/\/$/u);
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
    await expect(page).toHaveURL(/\/$/u);
    await expectPresentedPage(page, TEST_IDS.landingPage);
  });

  test('sends an anonymous visitor from a protected route to the landing page', async ({
    page,
  }) => {
    await gotoApp(page, APP_ROUTES.home);

    // The landing page carries the sign-in CTA one click away and reads
    // correctly for a visitor who was never authenticated — see
    // guard-presentation.helper for why this is not a bounce to /login.
    await expect(page.getByTestId(TEST_IDS.landingPage)).toBeVisible();
    await expect(page).toHaveURL(/\/$/u);
  });

  test('deep-links from the Home attendance widget to the owning screen', async ({ page }) => {
    await signIn(page, {
      email: MOCK_PERSONA_EMAILS.member,
      password: MOCK_CREDENTIALS.password,
    });
    await expectPresentedPage(page, TEST_IDS.homePage);

    await page.getByTestId(`${TEST_IDS.dashboardWidgetLink}-member-attendance`).click();

    await expectPresentedPage(page, TEST_IDS.myAttendancePage);
    await expect(page).toHaveURL(/\/my-attendance$/u);
    await expect(page.getByTestId(TEST_IDS.myAttendanceParticipationCard)).toBeVisible();
  });

  test('deep-links from the Home feedback widget to the feedback tab', async ({ page }) => {
    await signIn(page, {
      email: MOCK_PERSONA_EMAILS.member,
      password: MOCK_CREDENTIALS.password,
    });
    await expectPresentedPage(page, TEST_IDS.homePage);

    await page.getByTestId(`${TEST_IDS.dashboardWidgetLink}-member-feedback`).click();

    await expectPresentedPage(page, TEST_IDS.performancePage);
    await expect(page).toHaveURL(/\/performance\/feedback$/u);
    await expect(page.getByTestId(TEST_IDS.coachFeedbackPanel)).toBeVisible();
  });
});
