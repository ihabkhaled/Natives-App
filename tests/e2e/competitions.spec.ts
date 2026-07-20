import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, gotoApp, login, waitForAppAnimations } from './fixtures/app.fixture';

const LEAGUE_ID = '60000000-0000-4000-8000-000000000001';
const DRAFT_SQUAD_ID = 'b0000000-0000-4000-8000-000000000001';

test.describe('competitions and squads', () => {
  test('lists the team competitions and opens one', async ({ page }) => {
    await login(page);
    await gotoApp(page, APP_ROUTES.competitions);

    await expect(page.getByTestId(TEST_IDS.competitionsList)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.competitionCard).first()).toBeVisible();

    await page.getByTestId(TEST_IDS.competitionOpen).first().click();
    await expect(page.getByTestId(TEST_IDS.competitionSummary)).toBeVisible();
  });

  test('shows stages, fixtures in Cairo time, and the opponent directory', async ({ page }) => {
    await login(page);
    await gotoApp(page, `${APP_ROUTES.competitions}/${LEAGUE_ID}`);

    await expect(page.getByTestId(TEST_IDS.competitionStages)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.competitionFixture).first()).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.competitionOpponents)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.competitionFixtures)).toContainText('travel delay');
  });

  test('presents eligibility as advisory and never as an exclusion', async ({ page }) => {
    await login(page);
    await gotoApp(page, `${APP_ROUTES.squads}/${DRAFT_SQUAD_ID}`);

    await expect(page.getByTestId(TEST_IDS.squadEligibilityAdvisory)).toContainText(
      'never an automatic exclusion',
    );
    const rows = page.getByTestId(TEST_IDS.squadEligibilityRow);
    await expect(rows).toHaveCount(5);
    await expect(page.getByTestId(TEST_IDS.squadEligibilityPanel)).toContainText('Not enough data');
  });

  test('demands a written reason before recording a coach override', async ({ page }) => {
    await login(page);
    await gotoApp(page, `${APP_ROUTES.squads}/${DRAFT_SQUAD_ID}`);

    const flagged = page
      .getByTestId(TEST_IDS.squadEligibilityRow)
      .filter({ hasText: 'Youssef Adel' });
    await flagged.getByTestId(TEST_IDS.squadSelectAction).click();

    const panel = page.getByTestId(TEST_IDS.squadOverridePanel);
    await expect(panel).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.squadOverrideConfirm)).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await page
      .getByTestId(TEST_IDS.squadOverrideReason)
      .locator('textarea')
      .fill('Needed for handler depth on the road.');
    await expect(page.getByTestId(TEST_IDS.squadOverrideConfirm)).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  test('shows the roster preview with its backend-pending notice', async ({ page }) => {
    await login(page);
    await gotoApp(page, `${APP_ROUTES.squads}/${DRAFT_SQUAD_ID}`);

    await expect(page.getByTestId(TEST_IDS.squadRosterPendingNotice)).toContainText(
      'live on the roster screens',
    );
    await expect(page.getByTestId(TEST_IDS.squadRosterRow).first()).toBeVisible();
  });

  test('@rtl mirrors the squad workspace for Arabic', async ({ page }) => {
    await login(page);
    await gotoApp(page, `${APP_ROUTES.squads}/${DRAFT_SQUAD_ID}`);
    await waitForAppAnimations(page);

    await expect(page.getByTestId(TEST_IDS.squadDetailView)).toBeVisible();
  });
});

test.describe('tryouts', () => {
  test('lets an anonymous candidate register only after explicit consent', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.tryoutRegistration);

    await expect(page.getByTestId(TEST_IDS.tryoutRegistrationPrivacy)).toContainText(
      'never shown in candidate lists',
    );
    await page.getByTestId(TEST_IDS.tryoutRegistrationName).locator('input').fill('Sara Nabil');
    await page
      .getByTestId(TEST_IDS.tryoutRegistrationEmail)
      .locator('input')
      .fill('sara.e2e@example.test');
    await expect(page.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await page.getByTestId(TEST_IDS.tryoutRegistrationConsent).click();
    await expect(page.getByTestId(TEST_IDS.tryoutRegistrationSubmit)).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await page.getByTestId(TEST_IDS.tryoutRegistrationSubmit).click();
    await expect(page.getByTestId(TEST_IDS.tryoutRegistrationSuccess)).toContainText(
      'You are registered',
    );
  });

  test('keeps candidate contacts and readiness out of the staff roll', async ({ page }) => {
    await login(page);
    await gotoApp(page, APP_ROUTES.tryouts);
    await page.getByTestId(TEST_IDS.tryoutOpen).first().click();

    const roll = page.getByTestId(TEST_IDS.tryoutCandidateList);
    await expect(roll).toBeVisible();
    await expect(roll).not.toContainText('@example.test');
    await expect(roll).not.toContainText('ankle');
  });

  test('reveals restricted candidate data only to a holder of the grants', async ({ page }) => {
    await login(page);
    await gotoApp(page, APP_ROUTES.tryouts);
    await page.getByTestId(TEST_IDS.tryoutOpen).first().click();
    await page.getByTestId(TEST_IDS.tryoutCandidateOpen).first().click();

    await expect(page.getByTestId(TEST_IDS.tryoutContacts)).toContainText('@example.test');
    await expect(page.getByTestId(TEST_IDS.tryoutEvaluationPanel)).toContainText('Not scored');
    await waitForAppAnimations(page);
  });
});
