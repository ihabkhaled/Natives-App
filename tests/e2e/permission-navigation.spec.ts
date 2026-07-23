import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { APP_ROUTES, expectPresentedPage, gotoApp, login, signIn } from './fixtures/app.fixture';

const HOME_NAV_ITEM = `${TEST_IDS.primaryNavItem}-home`;
const ADMIN_NAV_ITEM = `${TEST_IDS.primaryNavItem}-admin`;

/**
 * Every destination a member persona's scoped grants light up, in nav order.
 * This is the positive pin the recovery audit asked for: the collapsed-nav
 * regression (invited users seeing 3 items) can no longer pass silently.
 */
const MEMBER_NAV_KEYS = [
  'home',
  'practice-calendar',
  'my-attendance',
  'members',
  'performance',
  'training',
  'leaderboard',
  'points-history',
  'competitions',
  'squads',
  'rosters',
  'matches',
  'notifications',
  'settings',
] as const;

function personaLogin(email: string): { email: string; password: string } {
  return { email, password: MOCK_CREDENTIALS.password };
}

test.describe('permission-aware navigation', () => {
  test('an admin persona gets the admin destination and can open it', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.admin));
    await expectPresentedPage(page, TEST_IDS.homePage);

    await expect(page.getByTestId(HOME_NAV_ITEM)).toBeVisible();
    await page.getByTestId(ADMIN_NAV_ITEM).click();

    await expectPresentedPage(page, TEST_IDS.adminPage);
    await expect(page).toHaveURL(/\/admin$/u);
  });

  test('a member persona never sees the admin destination', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await expectPresentedPage(page, TEST_IDS.homePage);

    await expect(page.getByTestId(HOME_NAV_ITEM)).toBeVisible();
    await expect(page.getByTestId(ADMIN_NAV_ITEM)).toHaveCount(0);
  });

  test('a member persona gets exactly its 14 permitted destinations once scoped grants load', async ({
    page,
  }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await expectPresentedPage(page, TEST_IDS.homePage);
    await expect(page.getByTestId(HOME_NAV_ITEM)).toBeVisible();

    for (const key of MEMBER_NAV_KEYS) {
      await expect(page.getByTestId(`${TEST_IDS.primaryNavItem}-${key}`)).toHaveCount(1);
    }
    await expect(page.locator(`[data-testid^="${TEST_IDS.primaryNavItem}-"]`)).toHaveCount(
      MEMBER_NAV_KEYS.length,
    );
  });

  test('an analyst persona never sees the self-service destinations', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.analyst));
    await expectPresentedPage(page, TEST_IDS.homePage);

    await expect(page.getByTestId(HOME_NAV_ITEM)).toBeVisible();
    await expect(page.getByTestId(`${TEST_IDS.primaryNavItem}-my-attendance`)).toHaveCount(0);
    await expect(page.getByTestId(`${TEST_IDS.primaryNavItem}-performance`)).toHaveCount(0);
    await expect(page.getByTestId(`${TEST_IDS.primaryNavItem}-training`)).toHaveCount(0);
  });

  test('a direct admin URL reveals no admin content to a member persona', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await expectPresentedPage(page, TEST_IDS.homePage);

    await gotoApp(page, APP_ROUTES.admin);

    await expect(page.getByTestId(TEST_IDS.guardForbidden)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.adminPage)).toHaveCount(0);
  });

  test('the skip link is focusable and targets the main content landmark', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.welcome);

    const skipLink = page.getByTestId(TEST_IDS.skipLink);
    await skipLink.focus();

    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute('href', `#${TEST_IDS.mainContent}`);
    await expect(page.getByTestId(TEST_IDS.mainContent)).toBeAttached();
  });
});
