import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_ASSESSMENT_IDS } from '@/tests/msw/assessments-data.fixture';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  APP_ROUTES,
  expectPresentedPage,
  gotoApp,
  login,
  switchToArabic,
} from './fixtures/app.fixture';

const ASSESSMENTS_NAV_ITEM = `${TEST_IDS.primaryNavItem}-assessments`;

test.describe('assessment entry and player performance', () => {
  test('opens an assessment from the workspace and never renders a gap as zero', async ({
    page,
  }) => {
    await login(page);
    await expectPresentedPage(page, TEST_IDS.homePage);

    await page.getByTestId(ASSESSMENTS_NAV_ITEM).click();
    await expectPresentedPage(page, TEST_IDS.assessmentsPage);
    await expect(page.getByTestId(TEST_IDS.assessmentsList)).toBeVisible();

    await page.getByTestId(TEST_IDS.assessmentSummaryCard).first().getByText('Open').click();
    await expectPresentedPage(page, TEST_IDS.assessmentEntryPage);
    await expect(page.getByTestId(TEST_IDS.assessmentMetricGrid)).toBeVisible();

    const unevaluated = page.locator(
      `[data-testid="${TEST_IDS.assessmentMetricField}"][data-evaluated="false"]`,
    );
    await expect(unevaluated.first()).toBeVisible();
    await expect(unevaluated.first().getByTestId(TEST_IDS.assessmentMetricValueReadout)).toHaveText(
      'Not evaluated',
    );
  });

  test('walks a draft through submit and into review', async ({ page }) => {
    await login(page);
    await gotoApp(page, `${APP_ROUTES.assessments}/${MOCK_ASSESSMENT_IDS.draft}`);
    await expectPresentedPage(page, TEST_IDS.assessmentEntryPage);

    await page.getByTestId(TEST_IDS.assessmentSubmit).click();
    await expect(page.getByTestId(TEST_IDS.assessmentStartReview)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.assessmentSaveDraft)).toHaveCount(0);
  });

  test('shows the player performance charts with their tabular alternatives', async ({ page }) => {
    await login(page, { email: MOCK_PERSONA_EMAILS.member, password: MOCK_CREDENTIALS.password });
    await gotoApp(page, APP_ROUTES.performance);
    await expectPresentedPage(page, TEST_IDS.performancePage);

    await expect(page.getByTestId(TEST_IDS.performanceTrendChart)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.performanceRadarChart)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.chartDataTable)).toHaveCount(2);
    await expect(page.getByTestId(TEST_IDS.coachFeedbackCard)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.developmentGoalCard).first()).toBeVisible();
  });

  test('keeps a member persona out of the coach workspace', async ({ page }) => {
    await login(page, { email: MOCK_PERSONA_EMAILS.member, password: MOCK_CREDENTIALS.password });
    await gotoApp(page, APP_ROUTES.assessments);

    await expect(page.getByTestId(TEST_IDS.assessmentsList)).toHaveCount(0);
  });

  test('renders the Arabic assessment workspace right-to-left @rtl', async ({ page }) => {
    // Direction follows the persisted locale, so switch to Arabic first.
    await login(page);
    await gotoApp(page, APP_ROUTES.settings);
    await switchToArabic(page);

    await gotoApp(page, APP_ROUTES.assessments);
    await expectPresentedPage(page, TEST_IDS.assessmentsPage);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId(TEST_IDS.assessmentsList)).toBeVisible();
  });
});
