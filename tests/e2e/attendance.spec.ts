import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  APP_ROUTES,
  expectPresentedPage,
  gotoApp,
  login,
  setOffline,
} from './fixtures/app.fixture';

function personaLogin(email: string): { email: string; password: string } {
  return { email, password: MOCK_CREDENTIALS.password };
}

async function openCoachAttendance(page: Parameters<typeof login>[0]): Promise<void> {
  await login(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
  await expectPresentedPage(page, TEST_IDS.homePage);
  await gotoApp(page, APP_ROUTES.attendance);
  await expectPresentedPage(page, TEST_IDS.attendancePage);
  await expect(page.getByTestId(TEST_IDS.attendanceRosterRow)).toHaveCount(4);
}

test.describe('coach attendance experience', () => {
  test('bulk marks and finalizes the complete roster', async ({ page }) => {
    await openCoachAttendance(page);

    await expect(page.getByText('3 of 4 marked')).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.attendancePrivacyNotice)).toBeVisible();

    await page.getByTestId(TEST_IDS.attendanceMarkAllPresent).click();
    // Ionic reflects the disabled state through aria-disabled; ion-button is a
    // custom element, so Playwright's toBeDisabled/toBeEnabled never fire here.
    await expect(page.getByTestId(TEST_IDS.attendanceSubmit)).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await page.getByTestId(TEST_IDS.attendanceSubmit).click();

    await expect(page.getByText('4 of 4 marked')).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.attendanceSubmit)).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await expect(page.getByTestId(TEST_IDS.attendanceFinalize)).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await page.getByTestId(TEST_IDS.attendanceFinalize).click();

    const confirm = page
      .locator('ion-alert')
      .getByRole('button', { name: 'Finalize', exact: true });
    await expect(confirm).toBeVisible();
    await confirm.click();

    await expect(page.getByText('Finalized', { exact: true })).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.attendanceCorrectionReason).first()).toBeVisible();
  });

  test('queues offline changes, replays them, and exposes a resolvable conflict', async ({
    page,
  }) => {
    await openCoachAttendance(page);
    await setOffline(page, true);
    // Wait until the screen has registered the offline transition before marking,
    // so the submit is queued deliberately rather than racing a live request.
    await expect(page.getByText(/Offline changes are safely queued/u)).toBeVisible();

    await page.getByTestId(TEST_IDS.attendanceMarkAllPresent).click();
    await page.getByTestId(TEST_IDS.attendanceSubmit).click();

    await expect(page.getByText(/4 pending/u)).toBeVisible();
    await expect(page.getByText(/queued safely/u)).toBeVisible();

    await setOffline(page, false);
    await expect(page.getByTestId(TEST_IDS.attendanceConflict)).toBeVisible();
    await expect(page.getByText(/1 conflicts/u)).toBeVisible();

    await page.getByTestId(TEST_IDS.attendanceResolveConflict).click();
    await expect(page.getByTestId(TEST_IDS.attendanceConflict)).toHaveCount(0);
    await expect(page.getByText(/0 conflicts/u)).toBeVisible();
  });

  test('blocks a regular member before attendance data renders', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await expectPresentedPage(page, TEST_IDS.homePage);
    await gotoApp(page, APP_ROUTES.attendance);

    await expect(page.getByTestId(TEST_IDS.guardForbidden)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.attendancePage)).toHaveCount(0);
  });

  test('renders the complete workflow in Arabic RTL @rtl', async ({ page }) => {
    // Direction follows the persisted locale, not the Playwright project locale,
    // so switch to Arabic before opening attendance.
    await gotoApp(page, APP_ROUTES.settings);
    await page
      .getByTestId(TEST_IDS.settingsLocaleSelect)
      .locator('ion-segment-button[value="ar"]')
      .click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await openCoachAttendance(page);

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId(TEST_IDS.attendanceRosterRow)).toHaveCount(4);
    await expect(page.getByTestId(TEST_IDS.attendanceSubmit)).toBeVisible();
  });
});
