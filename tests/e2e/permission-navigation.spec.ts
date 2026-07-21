import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { APP_ROUTES, expectPresentedPage, gotoApp, login, signIn } from './fixtures/app.fixture';

const HOME_NAV_ITEM = `${TEST_IDS.primaryNavItem}-home`;
const ADMIN_NAV_ITEM = `${TEST_IDS.primaryNavItem}-admin`;

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
