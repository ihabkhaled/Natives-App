import { expect, test, type Page } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { APP_ROUTES, expectPresentedPage, gotoApp, signIn } from './fixtures/app.fixture';

function personaLogin(email: string): { email: string; password: string } {
  return { email, password: MOCK_CREDENTIALS.password };
}

/**
 * Confirm an Ionic alert and wait for it to actually go away.
 *
 * Ionic animates the dismissal, and the overlay keeps intercepting pointer
 * events until it finishes. Without waiting for detachment, a second confirm
 * in the same test clicks a button that is still on screen but no longer
 * connected, and hangs until the test times out.
 */
async function acceptAlert(page: Page, label: string): Promise<void> {
  const alert = page.locator('ion-alert');
  const confirm = alert.getByRole('button', { name: label, exact: true });
  await expect(confirm).toBeVisible();
  await confirm.click();
  await expect(alert).toHaveCount(0);
}

/**
 * A coach's recurring pattern: list it, edit it, and — the part no unit test
 * can prove — that generating sessions reports how many it actually created,
 * both destructive-adjacent actions confirm first, and a member never even
 * sees the destination.
 */
test.describe('practice schedules', () => {
  test('lists the recurring pattern a team practises on', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceSchedules);

    await expectPresentedPage(page, TEST_IDS.practiceSchedulesPage);
    await expect(page.getByText('Tuesday & Thursday practice')).toBeVisible();
  });

  test('opens a schedule and saves an edit', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceScheduleDetail);
    await expectPresentedPage(page, TEST_IDS.practiceScheduleDetailPage);

    const nameInput = page.getByTestId(TEST_IDS.practiceScheduleNameInput).locator('input');
    await nameInput.fill('Renamed practice');
    await page.getByTestId(TEST_IDS.practiceScheduleSave).click();

    await expect(page.getByTestId(TEST_IDS.practiceScheduleMessages)).toContainText('saved');
  });

  test('deletes a schedule only after the coach confirms', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceScheduleDetail);
    await expectPresentedPage(page, TEST_IDS.practiceScheduleDetailPage);

    await page.getByTestId(TEST_IDS.practiceScheduleDelete).click();
    await acceptAlert(page, 'Delete');

    await expectPresentedPage(page, TEST_IDS.practiceSchedulesPage);
  });

  /**
   * The sharp action: it creates real sessions, so it is confirmed first and
   * always reports a count — never a screen that looks like it did nothing.
   */
  test('generates sessions and reports how many it created', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceScheduleDetail);
    await expectPresentedPage(page, TEST_IDS.practiceScheduleDetailPage);

    await page.getByTestId(TEST_IDS.practiceScheduleGenerate).click();
    await acceptAlert(page, 'Generate');

    await expect(page.getByTestId(TEST_IDS.practiceScheduleMessages)).toContainText(
      'Created 3 new sessions',
    );
  });

  test('reports a clean re-run as already generated, not a duplicate', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceScheduleDetail);
    await expectPresentedPage(page, TEST_IDS.practiceScheduleDetailPage);

    await page.getByTestId(TEST_IDS.practiceScheduleGenerate).click();
    await acceptAlert(page, 'Generate');
    await expect(page.getByTestId(TEST_IDS.practiceScheduleMessages)).toContainText(
      'Created 3 new sessions',
    );

    await page.getByTestId(TEST_IDS.practiceScheduleGenerate).click();
    await acceptAlert(page, 'Generate');
    await expect(page.getByTestId(TEST_IDS.practiceScheduleMessages)).toContainText(
      'already exist',
    );
  });

  test('never offers the workspace to a member', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await gotoApp(page, APP_ROUTES.practiceSchedules);

    await expect(page.getByTestId(TEST_IDS.guardForbidden)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.practiceSchedulesNew)).toHaveCount(0);
  });
});
