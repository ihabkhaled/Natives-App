import { expect, type Page, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  APP_ROUTES,
  expectPresentedPage,
  gotoApp,
  setOffline,
  signIn,
} from './fixtures/app.fixture';

function personaLogin(email: string): { email: string; password: string } {
  return { email, password: MOCK_CREDENTIALS.password };
}

async function openCoachAttendance(page: Page): Promise<void> {
  await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
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

    // Contract 1.6.0 roster identity: server-resolved names and RSVP chips.
    await expect(page.getByText('Alex Ranger')).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.attendanceRsvpChip)).toHaveCount(4);

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
    // The Coach bundle lacks attendance.correct: a finalized sheet renders
    // read-only for this persona — the audited correction editor never shows.
    await expect(page.getByTestId(TEST_IDS.attendanceCorrectionReason)).toHaveCount(0);
    await expect(page.getByTestId(TEST_IDS.attendanceSaveCorrection)).toHaveCount(0);
  });

  test('shows the audited correction editor to a team admin on a locked sheet', async ({
    page,
  }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.teamAdmin));
    await expectPresentedPage(page, TEST_IDS.homePage);
    await gotoApp(page, APP_ROUTES.attendance);
    await expectPresentedPage(page, TEST_IDS.attendancePage);

    await page.getByTestId(TEST_IDS.attendanceMarkAllPresent).click();
    await page.getByTestId(TEST_IDS.attendanceSubmit).click();
    await expect(page.getByText('4 of 4 marked')).toBeVisible();
    await page.getByTestId(TEST_IDS.attendanceFinalize).click();
    const confirm = page
      .locator('ion-alert')
      .getByRole('button', { name: 'Finalize', exact: true });
    await confirm.click();

    await expect(page.getByText('Finalized', { exact: true })).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.attendanceCorrectionReason).first()).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.attendanceSaveCorrection).first()).toBeVisible();
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
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await expectPresentedPage(page, TEST_IDS.homePage);
    await gotoApp(page, APP_ROUTES.attendance);

    await expect(page.getByTestId(TEST_IDS.guardForbidden)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.attendancePage)).toHaveCount(0);
  });

  test('reaches the capture screen through the session-detail CTA', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await expectPresentedPage(page, TEST_IDS.homePage);
    await gotoApp(page, APP_ROUTES.practiceSession);
    await expectPresentedPage(page, TEST_IDS.practiceSessionPage);

    await page.getByTestId(TEST_IDS.practiceSessionAttendanceCta).click();

    await expectPresentedPage(page, TEST_IDS.attendancePage);
    await expect(page.getByTestId(TEST_IDS.attendanceRosterRow)).toHaveCount(4);
  });

  test('hides the session-detail CTA from a member without attendance.record', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await expectPresentedPage(page, TEST_IDS.homePage);
    await gotoApp(page, APP_ROUTES.practiceSession);
    await expectPresentedPage(page, TEST_IDS.practiceSessionPage);

    await expect(page.getByTestId(TEST_IDS.rsvpControl)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.practiceSessionAttendanceCta)).toHaveCount(0);
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

test.describe('member self-attendance experience', () => {
  test('opens My attendance from the nav and renders the participation summary', async ({
    page,
  }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await expectPresentedPage(page, TEST_IDS.homePage);

    await page.getByTestId(`${TEST_IDS.primaryNavItem}-my-attendance`).click();

    await expectPresentedPage(page, TEST_IDS.myAttendancePage);
    await expect(page.getByTestId(TEST_IDS.myAttendanceParticipationCard)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.myAttendanceParticipationRate)).toContainText('90.9%');
    await expect(page.getByTestId(TEST_IDS.myAttendanceCheckInCard)).toBeVisible();
    await expect(page.getByText(/pending approval/u)).toBeVisible();

    // The check-in card renders the SERVER-ruled window: the next mock
    // session starts tomorrow, so the state is not_open with its instant —
    // no button, and no client-side provisional caveat anywhere.
    await expect(page.getByTestId(TEST_IDS.myAttendanceCheckInState)).toContainText(
      /Check-in opens/u,
    );
    await expect(page.getByTestId(TEST_IDS.myAttendanceCheckInButton)).toHaveCount(0);
    await expect(page.getByText(/Subject to confirmation/u)).toHaveCount(0);
  });

  test('pages the bounded self history through load-more', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await expectPresentedPage(page, TEST_IDS.homePage);
    await gotoApp(page, APP_ROUTES.myAttendance);
    await expectPresentedPage(page, TEST_IDS.myAttendancePage);

    await expect(page.getByTestId(TEST_IDS.myAttendanceHistorySection)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.myAttendanceHistoryRow)).toHaveCount(20);
    await expect(page.getByText('Not recorded').first()).toBeVisible();

    await page.getByTestId(TEST_IDS.myAttendanceHistoryLoadMore).click();

    await expect(page.getByTestId(TEST_IDS.myAttendanceHistoryRow)).toHaveCount(25);
    await expect(page.getByTestId(TEST_IDS.myAttendanceHistoryLoadMore)).toHaveCount(0);
  });
});
