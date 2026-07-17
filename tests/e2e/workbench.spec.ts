import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { APP_ROUTES, fillIonInput, gotoApp } from './fixtures/app.fixture';

test.describe('ui workbench', () => {
  test('renders every shared state primitive', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.workbench);

    const states = page.getByTestId(TEST_IDS.workbenchStates);
    await expect(states.getByTestId(TEST_IDS.loadingState)).toBeVisible();
    await expect(states.getByTestId(TEST_IDS.emptyState)).toBeVisible();
    await expect(states.getByTestId(TEST_IDS.errorState)).toBeVisible();
    await expect(states.getByTestId(TEST_IDS.offlineState)).toBeVisible();
    await expect(states.getByTestId(TEST_IDS.permissionState)).toBeVisible();
  });

  test('validates the reference form and reports success', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.workbench);

    await fillIonInput(page, TEST_IDS.workbenchFormEmail, 'not-an-email');
    await page.getByTestId(TEST_IDS.workbenchFormSubmit).click();
    await expect(page.getByText('Name is required.')).toBeVisible();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();

    await fillIonInput(page, TEST_IDS.workbenchFormName, 'Ranger');
    await fillIonInput(page, TEST_IDS.workbenchFormEmail, 'ranger@example.com');
    await page.getByTestId(TEST_IDS.workbenchFormSubmit).click();

    await expect(page.getByTestId(TEST_IDS.workbenchFormResult)).toContainText(
      'Submitted as Ranger',
    );
  });

  test('virtualizes the list instead of mounting every row', async ({ page }) => {
    await gotoApp(page, APP_ROUTES.workbench);

    const list = page.getByTestId(TEST_IDS.workbenchVirtualList);
    await expect(list).toBeVisible();
    await expect(list.getByTestId(TEST_IDS.virtualListItem).first()).toBeVisible();

    const mountedRows = await list.getByTestId(TEST_IDS.virtualListItem).count();
    expect(mountedRows).toBeGreaterThan(0);
    expect(mountedRows).toBeLessThan(100);

    await list.getByTestId(TEST_IDS.virtualListItem).first().scrollIntoViewIfNeeded();
    await list
      .locator('[data-virtuoso-scroller]')
      .first()
      .evaluate((element) => {
        element.scrollTop = 4000;
      });

    await expect(list.getByTestId(TEST_IDS.virtualListItem).first()).toBeVisible();
  });
});
