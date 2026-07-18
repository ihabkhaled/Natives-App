import { expect, test } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';

import { expectPresentedPage, login } from './fixtures/app.fixture';

const PRACTICE_NAV_ITEM = `${TEST_IDS.primaryNavItem}-practice-calendar`;

test.describe('practice experience', () => {
  test('opens the calendar from adaptive navigation and drills into a session', async ({
    page,
  }) => {
    await login(page);
    await expectPresentedPage(page, TEST_IDS.homePage);

    const practiceNavItem = page.getByTestId(PRACTICE_NAV_ITEM);
    await expect(practiceNavItem).toBeVisible();
    await practiceNavItem.click();

    await expectPresentedPage(page, TEST_IDS.practiceCalendarPage);
    await expect(page.getByTestId(TEST_IDS.practiceFilterBar)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.practiceSessionCard).first()).toBeVisible();
    await page.getByTestId(TEST_IDS.practiceSessionCard).first().click();

    await expectPresentedPage(page, TEST_IDS.practiceSessionPage);
    await expect(page.getByTestId(TEST_IDS.practiceSessionDetails)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.rsvpControl)).toBeVisible();
  });

  test('updates a session RSVP from the detail screen', async ({ page }) => {
    await login(page);
    await page.getByTestId(PRACTICE_NAV_ITEM).click();
    await expectPresentedPage(page, TEST_IDS.practiceCalendarPage);
    await page
      .getByTestId(TEST_IDS.practiceSessionCard)
      .filter({ hasText: 'Practice' })
      .first()
      .click();
    await expectPresentedPage(page, TEST_IDS.practiceSessionPage);

    const going = page.getByTestId(TEST_IDS.rsvpGoingButton);
    await going.click();

    await expect(going).toHaveAttribute('aria-pressed', 'true');
  });
});
