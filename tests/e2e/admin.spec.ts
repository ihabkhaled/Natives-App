import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  APP_ROUTES,
  expectPresentedPage,
  gotoApp,
  signIn,
  switchToArabic,
} from './fixtures/app.fixture';

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

  test('reads settings as human summaries and typed editors — no raw JSON', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminSettings);
    await expectPresentedPage(page, TEST_IDS.adminSettingsPage);

    const effective = page.getByTestId(TEST_IDS.adminEffectivePanel);
    await expect(effective).toContainText('3 tiers up to 500 pts');
    await expect(effective).not.toContainText('{');
    // The canonical statuses editor renders reorderable rows by default.
    await expect(page.getByTestId(TEST_IDS.adminSettingEditor).first()).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.adminVersionValue)).toHaveCount(0);
  });

  test('schedules an attendance statuses change through the real UI', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminSettings);
    await expectPresentedPage(page, TEST_IDS.adminSettingsPage);

    // Archive the "excused" status (third row) through its active toggle —
    // a typed edit, addressed by canonical order rather than free text.
    const excusedRow = page.getByTestId(TEST_IDS.adminEditorRow).nth(2);
    await expect(excusedRow.getByTestId('status-2-label-en').locator('input')).toHaveValue(
      'Excused',
    );
    await excusedRow.locator('ion-checkbox').nth(2).click();

    // Pick a future Cairo instant from the real calendar.
    await page.getByTestId(`${TEST_IDS.adminVersionEffectiveFrom}-trigger`).click();
    await page
      .getByTestId(TEST_IDS.adminVersionEffectiveInput)
      .locator('.calendar-day[data-day="28"][data-month="7"][data-year="2026"]')
      .click();
    await page
      .getByTestId(TEST_IDS.adminVersionNote)
      .locator('textarea')
      .fill('Trial without excused status');

    await expect(page.getByTestId(TEST_IDS.adminVersionSubmit)).toBeEnabled();
    await page.getByTestId(TEST_IDS.adminVersionSubmit).click();

    const history = page.getByTestId(TEST_IDS.adminVersionsPanel);
    await expect(history).toContainText('Scheduled');
    await expect(history).toContainText('excused · active');
  });

  test('derives the weights editor rows from the statuses in effect', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminSettings);
    await expectPresentedPage(page, TEST_IDS.adminSettingsPage);

    await page.getByTestId(TEST_IDS.adminSettingKeySelect).click();
    await page.locator('ion-alert .alert-radio-button', { hasText: 'Attendance weights' }).click();
    await page.locator('ion-alert button', { hasText: 'OK' }).click();

    await expect(page.getByTestId('admin-editor-row-weight-injured')).toBeVisible();
    // Coverage is structural: the missing injured weight blocks the submit.
    await expect(page.getByTestId(TEST_IDS.adminVersionIssue)).toContainText(
      'No weight for injured.',
    );
    // Ionic marks a disabled ion-button with aria-disabled; the native
    // :disabled pseudo-state does not apply to a custom element.
    await expect(page.getByTestId(TEST_IDS.adminVersionSubmit)).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  test('keeps the settings read-only for a coach without the manage grant', async ({ page }) => {
    await signIn(page, { email: MOCK_PERSONA_EMAILS.coach, password: MOCK_CREDENTIALS.password });
    await gotoApp(page, APP_ROUTES.adminSettings);
    await expectPresentedPage(page, TEST_IDS.adminSettingsPage);

    await expect(page.getByTestId(TEST_IDS.adminSettingsView)).toContainText(
      'read this configuration but not change it',
    );
    await expect(page.getByTestId(TEST_IDS.adminVersionForm)).toHaveCount(0);
  });

  test('renders the editors and history in Arabic with RTL layout', async ({ page }) => {
    await signIn(page);
    await gotoApp(page, APP_ROUTES.settings);
    await switchToArabic(page);
    await gotoApp(page, APP_ROUTES.adminSettings);
    await expectPresentedPage(page, TEST_IDS.adminSettingsPage);

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId(TEST_IDS.adminEffectivePanel)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.adminSettingEditor).first()).toBeVisible();
  });

  test('keeps the editor and history usable on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await signIn(page);
    await gotoApp(page, APP_ROUTES.adminSettings);
    await expectPresentedPage(page, TEST_IDS.adminSettingsPage);

    await expect(page.getByTestId(TEST_IDS.adminSettingEditor).first()).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.adminSettingHistory).first()).toBeVisible();
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
