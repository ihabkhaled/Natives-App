import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { APP_ROUTES, expectPresentedPage, gotoApp, signIn } from './fixtures/app.fixture';

function personaLogin(email: string): { email: string; password: string } {
  return { email, password: MOCK_CREDENTIALS.password };
}

/**
 * A coach's actual question before a session: who is coming, and — when
 * someone told them in person rather than through the app — can they record
 * that on the member's behalf, with the change attributable afterward.
 */
test.describe('practice RSVP detail', () => {
  test('shows the roster and the planning summary', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceRsvpDetail);

    await expectPresentedPage(page, TEST_IDS.practiceRsvpDetailPage);
    await expect(page.getByTestId(TEST_IDS.practiceRsvpDetailSummary)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.practiceRsvpDetailRosterRow).first()).toBeVisible();
  });

  test('overrides a member after confirming, and the roster reflects it', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceRsvpDetail);
    await expectPresentedPage(page, TEST_IDS.practiceRsvpDetailPage);

    await page.getByTestId(TEST_IDS.practiceRsvpDetailOverrideAction).first().click();
    await expect(page.getByTestId(TEST_IDS.practiceRsvpDetailOverridePanel)).toBeVisible();

    await page.getByTestId(TEST_IDS.practiceRsvpDetailOverrideStatus).click();
    await page.locator('ion-alert .alert-radio-button', { hasText: 'Not going' }).click();
    await page.locator('ion-alert button', { hasText: 'OK' }).click();

    await page
      .getByTestId(TEST_IDS.practiceRsvpDetailOverrideReason)
      .locator('textarea')
      .fill('Told us in person at the field.');
    await page.getByTestId(TEST_IDS.practiceRsvpDetailOverrideSubmit).click();

    // An override changes somebody else's answer, so it is confirmed before
    // it ever reaches the server.
    const confirm = page
      .locator('ion-alert')
      .getByRole('button', { name: 'Yes, override', exact: true });
    await expect(confirm).toBeVisible();
    await confirm.click();

    await expect(page.getByTestId(TEST_IDS.practiceRsvpDetailOverridePanel)).toHaveCount(0);
  });

  /**
   * History is the reason the override endpoint is trustworthy: it stays
   * visible for a member, not only right after a coach changes something.
   */
  test('opens one member\'s history on demand', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceRsvpDetail);
    await expectPresentedPage(page, TEST_IDS.practiceRsvpDetailPage);

    await page.getByTestId(TEST_IDS.practiceRsvpDetailHistoryAction).first().click();

    await expect(page.getByTestId(TEST_IDS.practiceRsvpDetailHistoryPanel)).toBeVisible();
  });

  /**
   * The route carries `practice.manage`, so a member is stopped by the guard
   * before the screen mounts at all — the screen's own permission state is
   * the second line, for a principal whose grants change under them.
   */
  test('never offers the screen to a member', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await gotoApp(page, APP_ROUTES.practiceRsvpDetail);

    await expect(page.getByTestId(TEST_IDS.guardForbidden)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.practiceRsvpDetailOverrideAction)).toHaveCount(0);
  });
});
