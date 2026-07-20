import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_SCENARIO_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  APP_ROUTES,
  expectPresentedPage,
  fillIonInput,
  gotoApp,
  login,
} from './fixtures/app.fixture';

test.describe('authentication', () => {
  test('signs in with valid credentials and reaches the protected home screen', async ({
    page,
  }) => {
    await login(page);

    await expectPresentedPage(page, TEST_IDS.homePage);
    await expect(page.getByTestId(TEST_IDS.homeGreeting)).toContainText('Ranger One');
    await expect(page.getByTestId(TEST_IDS.healthCard)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.healthStatus)).toContainText('Operational');
  });

  test('shows sanitized copy for invalid credentials and stays on login', async ({ page }) => {
    await login(page, { email: MOCK_CREDENTIALS.email, password: 'WrongPassword#1' });

    const error = page.getByTestId(TEST_IDS.loginErrorMessage);
    await expect(error).toBeVisible();
    await expect(error).toHaveText('The email or password is incorrect.');
    await expectPresentedPage(page, TEST_IDS.loginPage);
  });

  test('maps a locked account to a permission message, never the backend text', async ({
    page,
  }) => {
    await login(page, { email: MOCK_SCENARIO_EMAILS.forbidden, password: 'Whatever#1234' });

    const error = page.getByTestId(TEST_IDS.loginErrorMessage);
    await expect(error).toHaveText('You do not have permission to do that.');
    await expect(error).not.toContainText('locked');
  });

  test('blocks submission until the form satisfies the schema', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.login);

    await fillIonInput(page, TEST_IDS.loginEmailInput, 'not-an-email');
    await fillIonInput(page, TEST_IDS.loginPasswordInput, 'short');
    await page.getByTestId(TEST_IDS.loginSubmitButton).click();

    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
    await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible();
    await expectPresentedPage(page, TEST_IDS.loginPage);
  });

  test('keeps an authenticated visitor away from the login route', async ({ page }) => {
    await login(page);
    await expectPresentedPage(page, TEST_IDS.homePage);

    await gotoApp(page, APP_ROUTES.login);

    await expectPresentedPage(page, TEST_IDS.homePage);
  });

  test('signs out and returns to the public flow', async ({ page }) => {
    await login(page);
    await expectPresentedPage(page, TEST_IDS.homePage);

    await page.getByTestId(TEST_IDS.appBarUserMenuButton).click();
    await page.getByTestId(TEST_IDS.appBarSignOut).click();

    await expectPresentedPage(page, TEST_IDS.loginPage);
    await gotoApp(page, APP_ROUTES.home);
    await expectPresentedPage(page, TEST_IDS.loginPage);
  });

  test('never exposes tokens to localStorage', async ({ page }) => {
    await login(page);
    await expectPresentedPage(page, TEST_IDS.homePage);

    const localStorageDump = await page.evaluate(() => JSON.stringify(globalThis.localStorage));
    expect(localStorageDump).not.toContain('mock-access-token');
    expect(localStorageDump).not.toContain('mock-refresh-token');
  });
});
