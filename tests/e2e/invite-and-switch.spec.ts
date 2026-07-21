import { expect, test, type Page } from '@playwright/test';

import { TEST_IDS } from '@/shared/config';
import { MOCK_CREDENTIALS, MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  APP_ROUTES,
  expectPresentedPage,
  fillIonInput,
  gotoApp,
  login,
} from './fixtures/app.fixture';

function personaLogin(email: string): { email: string; password: string } {
  return { email, password: MOCK_CREDENTIALS.password };
}

/** Open the invite block and fill both halves of the one submission. */
async function fillInvite(page: Page): Promise<void> {
  await page.getByTestId(TEST_IDS.membersInviteButton).click();
  await fillIonInput(page, TEST_IDS.memberInviteEmail, 'recruit@example.com');
  await fillIonInput(page, TEST_IDS.memberInviteFullName, 'New Recruit');
  await page.getByTestId(TEST_IDS.memberInviteSubmit).click();
}

/**
 * Inviting a real person needs TWO records — an account invitation at the
 * identity layer and a roster profile in the team directory. The original
 * button created only the second, producing a directory row nobody could ever
 * sign in as. These journeys pin the whole flow, including the manual accept
 * link that is the only delivery a console-email deployment actually performs.
 */
test.describe('invite a member by email', () => {
  test('refuses to submit without an email, before the server ever sees it', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.admin));
    await gotoApp(page, APP_ROUTES.members);
    await page.getByTestId(TEST_IDS.membersInviteButton).click();

    // One form, both records: the account half and the roster half.
    await expect(page.getByTestId(TEST_IDS.memberInviteEmail)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.memberInviteRole)).toBeVisible();

    await fillIonInput(page, TEST_IDS.memberInviteFullName, 'New Recruit');
    await page.getByTestId(TEST_IDS.memberInviteSubmit).click();

    await expect(page.getByText('Enter the email address to invite.')).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.memberInviteSent)).toHaveCount(0);
  });

  test('reports where the invitation went and hands over the one-time link', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.admin));
    await gotoApp(page, APP_ROUTES.members);
    await fillInvite(page);

    const sent = page.getByTestId(TEST_IDS.memberInviteSent);
    await expect(sent).toBeVisible();
    await expect(sent).toContainText('recruit@example.com');
    await expect(page.getByTestId(TEST_IDS.memberInviteLink)).toContainText(
      '/accept-invitation?token=',
    );
    // The form is gone: the invitation exists, so there is nothing left to fill.
    await expect(page.getByTestId(TEST_IDS.memberInviteForm)).toHaveCount(0);
  });

  test('hands back to a blank form when the administrator is done', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.admin));
    await gotoApp(page, APP_ROUTES.members);
    await fillInvite(page);
    await expect(page.getByTestId(TEST_IDS.memberInviteSent)).toBeVisible();

    await page.getByTestId(TEST_IDS.memberInviteDone).click();

    await expect(page.getByTestId(TEST_IDS.memberInviteSent)).toHaveCount(0);
    await expect(page.getByTestId(TEST_IDS.memberInviteEmail).locator('input')).toHaveValue('');
  });

  test('never offers the invite affordance to a member', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await gotoApp(page, APP_ROUTES.members);
    await expectPresentedPage(page, TEST_IDS.membersPage);

    await expect(page.getByTestId(TEST_IDS.membersInviteButton)).toHaveCount(0);
  });
});

/**
 * The switcher exists only for a principal who genuinely holds more than one
 * team: one team is not a choice, and a disabled control in the chrome is
 * clutter rather than information.
 */
test.describe('team switcher', () => {
  test('collapses entirely for a single-team principal', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.admin));
    await expectPresentedPage(page, TEST_IDS.homePage);

    await expect(page.getByTestId(TEST_IDS.teamSwitcher)).toHaveCount(0);
  });
});

/**
 * The date field must never claim a date the form does not hold — the previous
 * control displayed today's date over an empty value, which is what made the
 * owner read it as a printed label rather than a picker.
 */
test.describe('date picker', () => {
  test('asks for a date instead of showing one, and opens a calendar', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await gotoApp(page, APP_ROUTES.training);
    await expectPresentedPage(page, TEST_IDS.trainingPage);

    const trigger = page.getByTestId('training-performed-on-datetime-trigger');
    await expect(trigger).toBeVisible();
    await expect(trigger).toContainText('Select a date');
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId(TEST_IDS.trainingDateInput)).toBeVisible();
  });

  test('is a real target, not a printed value', async ({ page }) => {
    await login(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await gotoApp(page, APP_ROUTES.training);
    await expectPresentedPage(page, TEST_IDS.trainingPage);

    const trigger = page.getByTestId('training-performed-on-datetime-trigger');
    const box = await trigger.boundingBox();

    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    await expect(
      page.getByText('Tap to open the calendar. You cannot pick a day in the future.'),
    ).toBeVisible();
  });
});
