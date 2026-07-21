import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';
import { MOCK_NOTIFICATIONS } from '@/tests/msw/notifications.fixture';

import { APP_ROUTES, expectPresentedPage, gotoApp, login } from './fixtures/app.fixture';

test.describe('notifications inbox', () => {
  test('lists grouped arrivals with their in-app delivery state', async ({ page }) => {
    await login(page);
    await gotoApp(page, APP_ROUTES.notifications);
    await expectPresentedPage(page, TEST_IDS.notificationsPage);

    await expect(page.getByTestId(TEST_IDS.notificationsGroup).first()).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.notificationDelivery).first()).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.notificationsBoundedNotice)).toContainText(
      'bounded page',
    );
  });

  test('is reachable from the app bar affordance and shows the unread badge', async ({ page }) => {
    await login(page);
    await expectPresentedPage(page, TEST_IDS.homePage);

    await expect(page.getByTestId(TEST_IDS.appBarNotificationsBadge)).toBeVisible();
    await page.getByTestId(TEST_IDS.appBarNotifications).click();
    await page.getByTestId(TEST_IDS.appBarNotificationsViewAll).click();

    await expectPresentedPage(page, TEST_IDS.notificationsPage);
  });

  test('locks the mandatory security category on every channel', async ({ page }) => {
    await login(page);
    await gotoApp(page, APP_ROUTES.notificationPreferences);
    await expectPresentedPage(page, TEST_IDS.notificationPrefsPage);

    await expect(page.getByTestId(TEST_IDS.notificationPrefsMandatory)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.notificationPrefsMatrix)).toContainText(
      'locked, not merely ignored',
    );
    await expect(page.getByTestId(TEST_IDS.quietHoursPanel)).toBeVisible();
  });

  test('re-checks authorization on arrival and refuses a revoked deep link', async ({ page }) => {
    await login(page, {
      email: MOCK_PERSONA_EMAILS.member,
      password: MOCK_CREDENTIALS.password,
    });
    await gotoApp(page, `/notifications/open/${MOCK_NOTIFICATIONS.forbiddenAttendanceId}`);

    await expect(page.getByTestId(TEST_IDS.notificationLinkForbidden)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.notificationLinkView)).not.toContainText(
      MOCK_NOTIFICATIONS.sessionId,
    );
  });

  test('routes an authorized deep link on to its target', async ({ page }) => {
    await login(page);
    await gotoApp(page, `/notifications/open/${MOCK_NOTIFICATIONS.unreadPracticeId}`);

    await expect(page).toHaveURL(/\/practices\//u);
  });
});
