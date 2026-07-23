import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, expectPresentedPage, gotoApp, signIn } from './fixtures/app.fixture';

test.describe('admin console', () => {
  test('offers one card per surface the administrator may open', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.admin);
    await expectPresentedPage(page, TEST_IDS.adminPage);

    await expect(page.getByTestId(TEST_IDS.adminHubCard)).toHaveCount(5);
  });

  test('shows effective configuration, its history, and the reference data', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminSettings);
    await expectPresentedPage(page, TEST_IDS.adminSettingsPage);

    await expect(page.getByTestId(TEST_IDS.adminEffectivePanel)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.adminVersionsPanel)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.adminSeasonsPanel)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.adminCatalogPanel)).toBeVisible();
  });

  test('bounds role assignment by the privilege ceiling', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminRoles);
    await expectPresentedPage(page, TEST_IDS.adminRolesPage);

    await expect(page.getByTestId(TEST_IDS.adminRolesMemberSelect)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.adminRolesCeiling)).toContainText('Select a member');
  });

  test('blocks a rule publish until a dry run has been seen', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminRules);
    await expectPresentedPage(page, TEST_IDS.adminRulesPage);

    await page.getByTestId(TEST_IDS.adminRuleOpen).nth(1).click();
    await expect(page.getByTestId(TEST_IDS.adminRuleLifecycle)).toContainText(
      'Run a simulation before publishing',
    );
    // Ionic marks a disabled ion-button with aria-disabled; the native
    // :disabled pseudo-state does not apply to a custom element.
    await expect(page.getByTestId(TEST_IDS.adminRuleSimulateRun)).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  test('reports operations state without ever showing an event payload', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminOperations);
    await expectPresentedPage(page, TEST_IDS.adminOpsPage);

    await expect(page.getByTestId(TEST_IDS.adminOutboxPanel)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.adminDeadLetterPanel)).toContainText(
      'Payload bodies stay on the server',
    );
    await expect(page.getByTestId(TEST_IDS.adminAuditPanel)).toContainText('fields changed');
  });
});
