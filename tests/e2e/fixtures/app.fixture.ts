import { expect, type Page } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS } from '@/tests/msw/mock-data.constants';

/**
 * Shared E2E helpers. Every selector goes through TEST_IDS so a renamed
 * test id fails typecheck instead of silently skipping assertions.
 */
export const APP_ROUTES = {
  root: '/',
  welcome: '/welcome',
  login: '/login',
  home: '/home',
  practices: '/practices',
  attendance: '/practices/sess-evening/attendance',
  members: '/members',
  assessments: '/assessments',
  performance: '/performance',
  training: '/training',
  trainingReview: '/training-review',
  leaderboard: '/leaderboard',
  points: '/points',
  competitions: '/competitions',
  squads: '/squads',
  rosters: '/rosters',
  tryoutRegistration: '/tryout-registration',
  tryouts: '/tryouts',
  admin: '/admin',
  settings: '/settings',
  workbench: '/workbench',
} as const;

/** Wait for the app shell: MSW + i18n + session bootstrap have all settled. */
export async function gotoApp(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.getByTestId(TEST_IDS.appShell)).toBeVisible();
}

/**
 * Assert a routed screen is the presented one.
 *
 * Mid-transition, Ionic's router outlet holds the outgoing and incoming pages
 * in the DOM at once, so a bare getByTestId can match two elements and trip
 * Playwright's strict mode. Ionic marks pages it has not presented yet with
 * `ion-page-invisible`, so excluding that class asserts what we actually mean:
 * this screen is the one on top.
 */
export async function expectPresentedPage(page: Page, testId: string): Promise<void> {
  await expect(page.locator(`[data-testid="${testId}"]:not(.ion-page-invisible)`)).toBeVisible();
}

/** Wait until Ionic route transitions have settled before visual or accessibility assertions. */
export async function waitForAppAnimations(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    globalThis.document.getAnimations().every((animation) => animation.playState === 'finished'),
  );
}

export async function fillIonInput(page: Page, testId: string, value: string): Promise<void> {
  await page.getByTestId(testId).locator('input').fill(value);
}

export async function login(
  page: Page,
  credentials: { email: string; password: string } = MOCK_CREDENTIALS,
): Promise<void> {
  await gotoApp(page, APP_ROUTES.login);
  await fillIonInput(page, TEST_IDS.loginEmailInput, credentials.email);
  await fillIonInput(page, TEST_IDS.loginPasswordInput, credentials.password);
  await page.getByTestId(TEST_IDS.loginSubmitButton).click();
}

/**
 * Sign in and wait until the authenticated shell is the presented page.
 *
 * `login` only clicks submit. A `page.goto` issued before the session write
 * lands reloads the app mid-authentication and boots it signed out, so any
 * suite that navigates straight after signing in must use this instead.
 */
export async function signIn(
  page: Page,
  credentials: { email: string; password: string } = MOCK_CREDENTIALS,
): Promise<void> {
  await login(page, credentials);
  await expectPresentedPage(page, TEST_IDS.homePage);
}

/** Force the app offline through the browser context (Capacitor Network reads navigator). */
export async function setOffline(page: Page, offline: boolean): Promise<void> {
  await page.context().setOffline(offline);
  await page.evaluate((isOffline) => {
    globalThis.dispatchEvent(new Event(isOffline ? 'offline' : 'online'));
  }, offline);
}

/** Switch the app to Arabic from the settings screen and await the RTL flip. */
export async function switchToArabic(page: Page): Promise<void> {
  await page
    .getByTestId(TEST_IDS.settingsLocaleSelect)
    .locator('ion-segment-button[value="ar"]')
    .click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
}
