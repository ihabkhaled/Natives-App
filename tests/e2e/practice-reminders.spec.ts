import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { APP_ROUTES, expectPresentedPage, gotoApp, signIn } from './fixtures/app.fixture';

function personaLogin(email: string): { email: string; password: string } {
  return { email, password: MOCK_CREDENTIALS.password };
}

/**
 * Reminders answer the question a coach actually has before a session: who has
 * not replied, and is it worth sending. The journey pins the counts, the two
 * actions, and — the part no unit test can prove — that pressing send reports
 * what was queued AND what was held back.
 */
test.describe('practice reminders', () => {
  test('reports who has not replied and what is due', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceReminders);

    await expectPresentedPage(page, TEST_IDS.practiceRemindersPage);
    await expect(page.getByTestId(TEST_IDS.practiceRemindersNoResponse)).toContainText('4');
    await expect(page.getByTestId(TEST_IDS.practiceRemindersWindow)).toContainText('open');
    await expect(page.getByTestId(TEST_IDS.practiceRemindersKinds)).toBeVisible();
  });

  test('names how many were queued and how many were held back', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceReminders);
    await expectPresentedPage(page, TEST_IDS.practiceRemindersPage);

    await page.getByTestId(TEST_IDS.practiceRemindersDispatch).click();

    const messages = page.getByTestId(TEST_IDS.practiceRemindersMessages);
    await expect(messages).toContainText('Queued 1 of 4');
    await expect(messages).toContainText('3 were held back');
    // Nothing is due any more, so the send must stop offering itself. Ionic
    // reflects that through aria-disabled; ion-button is a custom element, so
    // Playwright's toBeDisabled never fires here.
    await expect(page.getByTestId(TEST_IDS.practiceRemindersDispatch)).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  test('sends a test to the caller alone', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceReminders);
    await expectPresentedPage(page, TEST_IDS.practiceRemindersPage);

    await page.getByTestId(TEST_IDS.practiceRemindersTest).click();

    await expect(page.getByTestId(TEST_IDS.practiceRemindersMessages)).toContainText(
      'you and nobody else',
    );
  });

  /**
   * The route carries `practice.manage`, so a member is stopped by the guard
   * before the screen mounts at all — the screen's own permission state is the
   * second line, for a principal whose grants change under them.
   */
  test('never offers the screen to a member', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await gotoApp(page, APP_ROUTES.practiceReminders);

    await expect(page.getByTestId(TEST_IDS.guardForbidden)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.practiceRemindersDispatch)).toHaveCount(0);
  });
});
