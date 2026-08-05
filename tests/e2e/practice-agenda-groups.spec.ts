import { expect, test } from '@playwright/test';

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
 * A coach splits a session's roster into groups, assigns members, sees the
 * resolved plan those groups produce, and can copy an agenda from another
 * session instead of rebuilding it. The journey pins the parts no unit test
 * can prove: a real create/assign/remove round trip against the mock API,
 * and the confirm dialog that guards both removals.
 *
 * The mock groups fixture is one in-memory record per server process, not
 * scoped per test — the same restriction `practice-reminders`' `dispatched`
 * flag carries. Serial mode makes these tests build on each other
 * deliberately (create, then assign, then remove, then copy) instead of
 * racing another worker's mutation of the same state.
 */
test.describe('practice agenda groups', () => {
  test.describe.configure({ mode: 'serial' });

  test('shows the resolved plan with each station next to the group it belongs to', async ({
    page,
  }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceAgendaGroups);

    await expectPresentedPage(page, TEST_IDS.practiceAgendaGroupsPage);
    await expect(page.getByTestId(TEST_IDS.practiceAgendaGroupsPlan)).toBeVisible();
    await expect(page.getByText('Deep cuts')).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.practiceAgendaGroupsGroups)).toBeVisible();
  });

  test('creates a group and shows it once the plan is re-read', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceAgendaGroups);
    await expectPresentedPage(page, TEST_IDS.practiceAgendaGroupsPage);

    await fillIonInput(page, TEST_IDS.practiceAgendaGroupsCreateName, 'Rotation squad');
    await page.getByTestId(TEST_IDS.practiceAgendaGroupsCreateSubmit).click();

    await expect(page.getByText('Rotation squad')).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.practiceAgendaGroupsNotice)).toContainText('created');
  });

  test('adds a member to a group and removes it, each guarded or not as it should be', async ({
    page,
  }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceAgendaGroups);
    await expectPresentedPage(page, TEST_IDS.practiceAgendaGroupsPage);

    const addInput = page.getByTestId(TEST_IDS.practiceAgendaGroupsAddMemberInput).first();
    await addInput.locator('input').fill('membership-88');
    await page.getByTestId(TEST_IDS.practiceAgendaGroupsAddMemberSubmit).first().click();

    const memberRow = page
      .getByTestId(TEST_IDS.practiceAgendaGroupsMemberItem)
      .filter({ hasText: 'membership-88' });
    await expect(memberRow).toBeVisible();

    // Removing a member is destructive, so it is confirmed once before it fires.
    await memberRow.getByTestId(TEST_IDS.practiceAgendaGroupsMemberRemove).click();
    const confirmMember = page
      .locator('ion-alert')
      .getByRole('button', { name: 'Remove', exact: true });
    await expect(confirmMember).toBeVisible();
    await confirmMember.click();

    await expect(page.getByText('membership-88')).toHaveCount(0);
  });

  test('removes a group only once the coach confirms', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceAgendaGroups);
    await expectPresentedPage(page, TEST_IDS.practiceAgendaGroupsPage);

    await expect(page.getByTestId(TEST_IDS.practiceAgendaGroupsGroupRow).first()).toBeVisible();
    const before = await page.getByTestId(TEST_IDS.practiceAgendaGroupsGroupRow).count();
    await page.getByTestId(TEST_IDS.practiceAgendaGroupsGroupRemove).first().click();

    const confirm = page.locator('ion-alert').getByRole('button', { name: 'Remove', exact: true });
    await expect(confirm).toBeVisible();
    await confirm.click();

    await expect(page.getByTestId(TEST_IDS.practiceAgendaGroupsGroupRow)).toHaveCount(before - 1);
  });

  test('copies groups from another session and replaces the current ones', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.coach));
    await gotoApp(page, APP_ROUTES.practiceAgendaGroups);
    await expectPresentedPage(page, TEST_IDS.practiceAgendaGroupsPage);

    await fillIonInput(page, TEST_IDS.practiceAgendaGroupsCopySource, 'session-2');
    await page.getByTestId(TEST_IDS.practiceAgendaGroupsCopySubmit).click();

    await expect(page.getByText('Copied squad')).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.practiceAgendaGroupsNotice)).toContainText('copied');
  });

  /**
   * The route carries `practice.manage`, so a member is stopped by the guard
   * before the screen mounts — the plan carries private coach notes, and
   * splitting the roster is a coach's decision, not a member's to see.
   */
  test('never offers the screen to a member', async ({ page }) => {
    await signIn(page, personaLogin(MOCK_PERSONA_EMAILS.member));
    await gotoApp(page, APP_ROUTES.practiceAgendaGroups);

    await expect(page.getByTestId(TEST_IDS.guardForbidden)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.practiceAgendaGroupsCreateForm)).toHaveCount(0);
  });
});
