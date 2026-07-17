import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, fillIonInput, gotoApp, login } from '../e2e/fixtures/app.fixture';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function analyze(page: Page) {
  return new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
}

test.describe('accessibility (WCAG 2.2 AA)', () => {
  test('welcome screen has no violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.welcome);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('login screen has no violations, including its error state', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.login);
    expect((await analyze(page)).violations).toEqual([]);

    await fillIonInput(page, TEST_IDS.loginEmailInput, 'not-an-email');
    await page.getByTestId(TEST_IDS.loginSubmitButton).click();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();

    expect((await analyze(page)).violations).toEqual([]);
  });

  test('settings screen has no violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('workbench screen has no violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.workbench);
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('authenticated home screen has no violations', async ({ page }) => {
    await login(page);
    await expect(page.getByTestId(TEST_IDS.homePage)).toBeVisible();
    expect((await analyze(page)).violations).toEqual([]);
  });

  test('dark palette has no contrast violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await page
      .getByTestId(TEST_IDS.settingsThemeSelect)
      .locator('ion-segment-button[value="dark"]')
      .click();
    await expect(page.locator('html')).toHaveClass(/ion-palette-dark/u);

    expect((await analyze(page)).violations).toEqual([]);
  });

  test('Arabic RTL layout has no violations', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await page
      .getByTestId(TEST_IDS.settingsLocaleSelect)
      .locator('ion-segment-button[value="ar"]')
      .click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    expect((await analyze(page)).violations).toEqual([]);
  });

  test('interactive targets meet the 44px minimum', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.login);

    const submit = page.getByTestId(TEST_IDS.loginSubmitButton);
    const box = await submit.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});
