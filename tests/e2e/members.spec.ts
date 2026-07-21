import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { APP_ROUTES, expectPresentedPage, gotoApp, login, signIn } from './fixtures/app.fixture';

const MEMBERS_NAV_ITEM = `${TEST_IDS.primaryNavItem}-members`;

test.describe('member directory and profiles', () => {
  test('filters the roster and opens a member profile', async ({ page }) => {
    await login(page);
    await expectPresentedPage(page, TEST_IDS.homePage);

    await page.getByTestId(MEMBERS_NAV_ITEM).click();
    await expectPresentedPage(page, TEST_IDS.membersPage);
    await expect(page.getByTestId(TEST_IDS.membersList)).toBeVisible();

    await page.getByTestId(TEST_IDS.membersSearch).locator('input').fill('omar');
    await expect(page.getByText(/1 of 8 members/u)).toBeVisible();

    await page.getByRole('button', { name: 'Omar Hassan' }).click();
    await expectPresentedPage(page, TEST_IDS.memberProfilePage);
    await expect(page.getByTestId(TEST_IDS.memberProfileFields)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.memberLifecyclePanel)).toBeVisible();
  });

  test('tiers a member persona to a privacy-safe profile without admin panels', async ({
    page,
  }) => {
    await signIn(page, { email: MOCK_PERSONA_EMAILS.member, password: MOCK_CREDENTIALS.password });
    await gotoApp(page, `${APP_ROUTES.members}/mem-nadia`);

    await expectPresentedPage(page, TEST_IDS.memberProfilePage);
    await expect(page.getByTestId(TEST_IDS.memberProfileFields)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.memberLifecyclePanel)).toHaveCount(0);
    await expect(page.getByTestId(TEST_IDS.memberRolesPanel)).toHaveCount(0);
  });

  test('renders the Arabic directory right-to-left @rtl', async ({ page }) => {
    // Direction follows the persisted locale, not the Playwright project locale,
    // so switch to Arabic before opening the directory.
    await signIn(page);
    await expectPresentedPage(page, TEST_IDS.homePage);
    await gotoApp(page, APP_ROUTES.settings);
    await page
      .getByTestId(TEST_IDS.settingsLocaleSelect)
      .locator('ion-segment-button[value="ar"]')
      .click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await page.getByTestId(MEMBERS_NAV_ITEM).click();
    await expectPresentedPage(page, TEST_IDS.membersPage);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId(TEST_IDS.membersList)).toBeVisible();
  });
});
