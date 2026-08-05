import { expect, test, type Page } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  APP_ROUTES,
  expectPresentedPage,
  fillIonInput,
  gotoApp,
  signIn,
} from './fixtures/app.fixture';

function personaLogin(email: string): { email: string; password: string } {
  return { email, password: MOCK_CREDENTIALS.password };
}

/**
 * Choose an `ion-select` option through its default alert interface: open
 * it, pick the radio by its visible label, then confirm.
 */
async function chooseSelectOption(
  page: Page,
  selectTestId: string,
  optionLabel: string,
): Promise<void> {
  await page.getByTestId(selectTestId).click();
  await page.getByRole('radio', { name: optionLabel }).click();
  await page.getByRole('button', { name: 'OK' }).click();
}

/**
 * The drill catalogue is a coach's library: browse and search it, write a
 * new drill, edit one, and retire one that is no longer run — the archive
 * is a lifecycle step, not a deletion, so the record stays reachable.
 */
test.describe('drills catalogue', () => {
  test('lists both an active and an archived drill, distinguishably', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.drills);

    await expectPresentedPage(page, TEST_IDS.drillsPage);
    await expect(page.getByText('Give-and-go break')).toBeVisible();
    await expect(page.getByText('Zone breakdown')).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.drillStatusChip)).toHaveCount(2);
  });

  test('narrows the list as the coach searches', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.drills);
    await expectPresentedPage(page, TEST_IDS.drillsPage);

    await fillIonInput(page, TEST_IDS.drillsSearch, 'zone');

    await expect(page.getByTestId(TEST_IDS.drillCard)).toHaveCount(1);
    await expect(page.getByText('Zone breakdown')).toBeVisible();
    await expect(page.getByText('Give-and-go break')).toBeHidden();
  });

  test('writes a new drill and lands on its own detail screen', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.drillNew);
    await expectPresentedPage(page, TEST_IDS.drillDetailPage);

    await fillIonInput(page, TEST_IDS.drillNameInput, 'Deep cut ladder');
    await chooseSelectOption(page, TEST_IDS.drillCategorySelect, 'Cutting');
    await page.getByTestId(TEST_IDS.drillSaveButton).click();

    await expect(page.getByTestId(TEST_IDS.drillStatusChip)).toContainText('Active');
    await expect(page.getByTestId(TEST_IDS.drillArchiveButton)).toBeVisible();
  });

  test('edits an existing drill', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.drillDetail);
    await expectPresentedPage(page, TEST_IDS.drillDetailPage);
    await expect(page.getByTestId(TEST_IDS.drillNameInput).locator('input')).toHaveValue(
      'Give-and-go break',
    );

    await fillIonInput(page, TEST_IDS.drillNameInput, 'Give-and-go break v2');
    await page.getByTestId(TEST_IDS.drillSaveButton).click();

    await expect(page.getByTestId(TEST_IDS.drillNameInput).locator('input')).toHaveValue(
      'Give-and-go break v2',
    );
  });

  /**
   * Archive is a retirement, never a delete: the record and the form stay on
   * screen, only the lifecycle control is replaced by a plain notice.
   */
  test('archives a drill in place, with copy that never says "deleted"', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.drillDetail);
    await expectPresentedPage(page, TEST_IDS.drillDetailPage);

    await page.getByTestId(TEST_IDS.drillArchiveButton).click();
    await page.getByRole('button', { name: 'Archive', exact: true }).click();

    await expect(page.getByTestId(TEST_IDS.drillStatusChip)).toContainText('Archived');
    await expect(page.getByTestId(TEST_IDS.drillArchiveButton)).toHaveCount(0);
    await expect(page.getByTestId(TEST_IDS.drillArchivedNotice)).toContainText('archived');
    await expect(page.getByText(/deleted|removed/i)).toHaveCount(0);
  });

  test('never offers the catalogue to a member', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await gotoApp(page, APP_ROUTES.drills);

    await expect(page.getByTestId(TEST_IDS.guardForbidden)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.drillsNewButton)).toHaveCount(0);
  });
});
