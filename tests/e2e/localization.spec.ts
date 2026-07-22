import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import {
  APP_ROUTES,
  gotoApp,
  signIn,
  switchToArabic,
  waitForAppAnimations,
} from './fixtures/app.fixture';

/** Arabic-Indic digits. Scores and ranks must never render in these. */
const ARABIC_INDIC_DIGITS = /[\u0660-\u0669]/u;

/** Sub-pixel slack for a bounding-box edge compared against the viewport edge. */
const EDGE_TOLERANCE = 2;

test.describe('localization and RTL', () => {
  test('@rtl mirrors the shell chrome: sidebar, app bar, and nav', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await switchToArabic(page);
    await signIn(page);
    await waitForAppAnimations(page);

    const width = page.viewportSize()?.width ?? 0;
    const nav = await page.getByTestId(TEST_IDS.primaryNav).boundingBox();
    const bar = await page.getByTestId(TEST_IDS.appBar).boundingBox();

    expect(width).toBeGreaterThan(0);
    expect(nav).not.toBeNull();
    expect(bar).not.toBeNull();
    // A single RTL invariant that holds in both shell shapes without branching
    // on the breakpoint: the nav's trailing edge is the viewport's right edge.
    // The desktop sidebar sits on the (now-right) inline-start edge, and the
    // mobile tab bar spans the full width — both put the right edge at `width`.
    // In LTR the sidebar would sit on the left, so this is a real mirror check.
    expect((nav?.x ?? 0) + (nav?.width ?? 0)).toBeGreaterThan(width - EDGE_TOLERANCE);
    // The app bar keeps spanning the shell; only its contents mirror.
    expect(bar?.width ?? 0).toBeGreaterThan(width / 3);
  });

  test('@rtl keeps direction and copy through a hard refresh on a deep route', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await switchToArabic(page);

    // A hard refresh on a deep path must be served by the SPA rewrite, not a
    // 404 — the Capacitor/static-host trap this app has hit before.
    const response = await page.goto(APP_ROUTES.welcome);

    expect(response?.status()).toBe(200);
    await expect(page.getByTestId(TEST_IDS.welcomePage)).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  });

  test('@rtl renders leaderboard figures in Latin digits', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.settings);
    await switchToArabic(page);
    await signIn(page);
    await gotoApp(page, APP_ROUTES.leaderboard);
    await waitForAppAnimations(page);

    const table = page.getByTestId(TEST_IDS.leaderboardTable);
    await expect(table).toBeVisible();

    const figures = await table.innerText();
    expect(figures).toMatch(/\d/u);
    expect(figures).not.toMatch(ARABIC_INDIC_DIGITS);
  });
});
