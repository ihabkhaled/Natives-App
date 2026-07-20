import { expect, test, type Page } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import {
  APP_ROUTES,
  expectPresentedPage,
  gotoApp,
  login,
  waitForAppAnimations,
} from '../e2e/fixtures/app.fixture';

/**
 * Design-evidence capture. Not an assertion suite: it drives each screen in
 * light/dark and LTR/RTL at desktop and mobile widths and writes the frames a
 * reviewer looks at. Run explicitly with `--grep @design-capture`.
 */
const OUTPUT_DIR =
  'C:/Users/Ihab/AppData/Local/Temp/claude/d--Freelance-UltimateNatives/6949e5ba-a90d-42a2-b3cf-217d7e8f96f6/scratchpad/design-after';

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 412, height: 900 };

async function applyChrome(page: Page, theme: string, locale: string): Promise<void> {
  await gotoApp(page, APP_ROUTES.settings);
  await page
    .getByTestId(TEST_IDS.settingsThemeSelect)
    .locator(`ion-segment-button[value="${theme}"]`)
    .click();
  await page
    .getByTestId(TEST_IDS.settingsLocaleSelect)
    .locator(`ion-segment-button[value="${locale}"]`)
    .click();
  await waitForAppAnimations(page);
}

async function capture(page: Page, route: string, anchor: string, name: string): Promise<void> {
  await gotoApp(page, route);
  await expect(page.getByTestId(anchor).first()).toBeVisible();
  await waitForAppAnimations(page);
  await page.screenshot({ path: `${OUTPUT_DIR}/${name}.png`, fullPage: true });
}

const SCREENS = [
  { slug: 'home', route: APP_ROUTES.home, anchor: TEST_IDS.dashboardView },
  { slug: 'assessments', route: APP_ROUTES.assessments, anchor: TEST_IDS.assessmentsList },
  {
    slug: 'assessment-entry',
    route: `${APP_ROUTES.assessments}/asmt-draft-1`,
    anchor: TEST_IDS.assessmentMetricGrid,
  },
  { slug: 'performance', route: APP_ROUTES.performance, anchor: TEST_IDS.performanceTrendChart },
];

const VARIANTS = [
  { theme: 'light', locale: 'en', suffix: 'light-ltr' },
  { theme: 'dark', locale: 'en', suffix: 'dark-ltr' },
  { theme: 'light', locale: 'ar', suffix: 'light-rtl' },
  { theme: 'dark', locale: 'ar', suffix: 'dark-rtl' },
];

const VIEWPORTS = [
  { size: DESKTOP, label: 'desktop' },
  { size: MOBILE, label: 'mobile' },
];

test.describe('design capture @design-capture', () => {
  for (const viewport of VIEWPORTS) {
    for (const variant of VARIANTS) {
      test(`${viewport.label} ${variant.suffix}`, async ({ page }) => {
        test.slow();
        await page.setViewportSize(viewport.size);
        await login(page);
        await expectPresentedPage(page, TEST_IDS.homePage);
        await applyChrome(page, variant.theme, variant.locale);
        for (const screen of SCREENS) {
          await capture(
            page,
            screen.route,
            screen.anchor,
            `${screen.slug}-${viewport.label}-${variant.suffix}`,
          );
        }
      });
    }
  }
});
