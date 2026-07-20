import { expect, test, type Page } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, gotoApp, signIn, waitForAppAnimations } from '../e2e/fixtures/app.fixture';

/**
 * Design-evidence capture. Not an assertion suite: it drives each screen in
 * light/dark and LTR/RTL at desktop and mobile widths and writes the frames a
 * reviewer looks at. Run explicitly with `--grep @design-capture`.
 */
const OUTPUT_DIR =
  'C:/Users/Ihab/AppData/Local/Temp/claude/d--Freelance-UltimateNatives/6949e5ba-a90d-42a2-b3cf-217d7e8f96f6/scratchpad/design-after';

/** Deterministic ids from the mock fixtures the capture screens open. */
const DESIGN_IDS = {
  league: '60000000-0000-4000-8000-000000000001',
  draftSquad: 'b0000000-0000-4000-8000-000000000001',
  roster: '11000000-0000-4000-8000-000000000001',
} as const;

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
  { slug: 'external-training', route: APP_ROUTES.training, anchor: TEST_IDS.trainingComposer },
  {
    slug: 'training-review',
    route: APP_ROUTES.trainingReview,
    anchor: TEST_IDS.trainingReviewQueue,
  },
  { slug: 'leaderboard', route: APP_ROUTES.leaderboard, anchor: TEST_IDS.leaderboardTable },
  { slug: 'points-history', route: APP_ROUTES.points, anchor: TEST_IDS.pointsLedger },
  {
    slug: 'competitions',
    route: APP_ROUTES.competitions,
    anchor: TEST_IDS.competitionsList,
  },
  {
    slug: 'competition-detail',
    route: `${APP_ROUTES.competitions}/${DESIGN_IDS.league}`,
    anchor: TEST_IDS.competitionSummary,
  },
  {
    slug: 'squad-workspace',
    route: `${APP_ROUTES.squads}/${DESIGN_IDS.draftSquad}`,
    anchor: TEST_IDS.squadEligibilityPanel,
  },
  { slug: 'rosters', route: APP_ROUTES.rosters, anchor: TEST_IDS.rostersList },
  {
    slug: 'roster-workspace',
    route: `${APP_ROUTES.rosters}/${DESIGN_IDS.roster}`,
    anchor: TEST_IDS.rosterEntriesPanel,
  },
  {
    slug: 'tryout-registration',
    route: APP_ROUTES.tryoutRegistration,
    anchor: TEST_IDS.tryoutRegistrationSubmit,
  },
  { slug: 'tryouts', route: APP_ROUTES.tryouts, anchor: TEST_IDS.tryoutsList },
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
        await signIn(page);
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
