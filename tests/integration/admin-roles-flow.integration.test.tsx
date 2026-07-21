import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { AdminRolesContainer } from '@/modules/admin/containers/admin-roles.container';
import { getEnvironment } from '@/packages/environment';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import { initTestI18n } from '../setup/i18n-test.helper';
import {
  clearSessionAfterTest,
  resetSessionForTest,
  signInAs,
} from '../setup/integration-session.helper';
import { fireIonChange, fireIonCheckboxChange, fireIonInput } from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';

const WAIT = { timeout: 5000 };

function apiUrl(path: string): string {
  return `${getEnvironment().apiBaseUrl}${path}`;
}

function useRoles(roles: readonly string[], assignableRoles: readonly string[]): void {
  mockApiServer.use(
    http.get(apiUrl('/teams/:teamId/members/:membershipId/roles'), ({ params }) =>
      HttpResponse.json({
        membershipId: String(params.membershipId),
        roles: [...roles],
        assignableRoles: [...assignableRoles],
      }),
    ),
  );
}

async function openRoles(): Promise<void> {
  await signInAs(MOCK_PERSONA_EMAILS.admin);
  renderRoute(APP_PATHS.adminRoles, APP_PATHS.adminRoles, <AdminRolesContainer />);
  await screen.findByTestId(TEST_IDS.adminRolesMemberSelect, {}, WAIT);
}

async function selectFirstMember(): Promise<void> {
  fireIonChange(screen.getByTestId(TEST_IDS.adminRolesMemberSelect), 'mem-omar');
  await screen.findByTestId(TEST_IDS.adminRolesPanel, {}, WAIT);
}

beforeEach(async () => {
  await initTestI18n();
  await resetSessionForTest();
});

afterEach(async () => {
  await clearSessionAfterTest();
});

describe('role assignment respects the privilege ceiling', () => {
  it('prompts for a member before showing any roles', async () => {
    await openRoles();

    expect(screen.getByTestId(TEST_IDS.adminRolesCeiling)).toHaveTextContent(
      'Select a member to review their roles',
    );
    expect(screen.queryByTestId(TEST_IDS.adminRolesPanel)).not.toBeInTheDocument();
  });

  it('offers exactly the server assignable roles, never more', async () => {
    useRoles(['member'], ['member', 'coach']);
    await openRoles();
    await selectFirstMember();

    const toggles = within(screen.getByTestId(TEST_IDS.adminRolesAssignable)).getAllByTestId(
      TEST_IDS.adminRolesToggle,
    );

    expect(toggles).toHaveLength(2);
    expect(screen.getByTestId(TEST_IDS.adminRolesAssignable)).not.toHaveTextContent(
      'Team administrator',
    );
  });

  it('never offers a role the member holds but the actor may not grant', async () => {
    useRoles(['team_admin'], ['member']);
    await openRoles();
    await selectFirstMember();

    expect(
      within(screen.getByTestId(TEST_IDS.adminRolesAssignable)).getAllByTestId(
        TEST_IDS.adminRolesToggle,
      ),
    ).toHaveLength(1);
  });

  it('states the ceiling rather than leaving it implicit', async () => {
    useRoles(['member'], ['member']);
    await openRoles();
    await selectFirstMember();

    expect(screen.getByTestId(TEST_IDS.adminRolesPanel)).toHaveTextContent(
      'Only roles inside your own privilege ceiling are listed',
    );
  });

  it('says plainly when the actor holds nothing it can pass on', async () => {
    useRoles(['member'], []);
    await openRoles();
    await selectFirstMember();

    expect(screen.getByTestId(TEST_IDS.adminRolesPanel)).toHaveTextContent(
      'You hold no role you can pass on here',
    );
  });

  it('shows the roles the member currently holds', async () => {
    useRoles(['member', 'coach'], ['member', 'coach']);
    await openRoles();
    await selectFirstMember();

    expect(screen.getByTestId(TEST_IDS.adminRolesCurrent)).toHaveTextContent('Member · Coach');
  });

  it('says "no role assigned" instead of rendering a blank line', async () => {
    useRoles([], ['member']);
    await openRoles();
    await selectFirstMember();

    expect(screen.getByTestId(TEST_IDS.adminRolesCurrent)).toHaveTextContent('No role assigned');
  });
});

describe('an audited change needs a reason', () => {
  it('blocks the save until a reason is given', async () => {
    useRoles(['member'], ['member', 'coach']);
    await openRoles();
    await selectFirstMember();

    expect(screen.getByTestId(TEST_IDS.adminRolesSave)).toBeDisabled();
    expect(screen.getByTestId(TEST_IDS.adminRolesPanel)).toHaveTextContent('Give a reason');
  });

  it('sends only the selected roles once a reason is present', async () => {
    let submitted: unknown = null;
    useRoles(['member'], ['member', 'coach']);
    mockApiServer.use(
      http.put(apiUrl('/teams/:teamId/members/:membershipId/roles'), async ({ request, params }) => {
        submitted = await request.json();
        return HttpResponse.json({
          membershipId: String(params.membershipId),
          roles: ['member', 'coach'],
          assignableRoles: ['member', 'coach'],
        });
      }),
    );
    await openRoles();
    await selectFirstMember();

    const coach = within(screen.getByTestId(TEST_IDS.adminRolesAssignable)).getAllByTestId(
      TEST_IDS.adminRolesToggle,
    )[1]!;
    fireIonCheckboxChange(coach, true);
    fireIonInput(screen.getByTestId(TEST_IDS.adminRolesReason), 'Promoted after the AGM');

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminRolesSave)).toBeEnabled();
    }, WAIT);
    fireEvent.click(screen.getByTestId(TEST_IDS.adminRolesSave));

    await waitFor(() => {
      expect(submitted).toEqual({ roles: ['member', 'coach'] });
    }, WAIT);
  });

  it('drops a role by toggling it off again', async () => {
    useRoles(['member', 'coach'], ['member', 'coach']);
    await openRoles();
    await selectFirstMember();

    const coach = within(screen.getByTestId(TEST_IDS.adminRolesAssignable)).getAllByTestId(
      TEST_IDS.adminRolesToggle,
    )[1]!;
    fireIonCheckboxChange(coach, false);

    await waitFor(() => {
      expect(
        within(screen.getByTestId(TEST_IDS.adminRolesAssignable)).getAllByTestId(
          TEST_IDS.adminRolesToggle,
        )[1],
      ).not.toBeChecked();
    }, WAIT);
  });
});

describe('designed states', () => {
  it('renders the designed forbidden state without the role-management grant', async () => {
    await signInAs(MOCK_PERSONA_EMAILS.member);
    renderRoute(APP_PATHS.adminRoles, APP_PATHS.adminRoles, <AdminRolesContainer />);

    expect(await screen.findByTestId(TEST_IDS.adminRolesForbidden, {}, WAIT)).toBeInTheDocument();
  });

  it('renders the designed error state when the directory cannot be read', async () => {
    mockApiServer.use(
      http.get(apiUrl('/teams/:teamId/members'), () =>
        HttpResponse.json({ bad: true }, { status: 500 }),
      ),
    );

    await signInAs(MOCK_PERSONA_EMAILS.admin);
    renderRoute(APP_PATHS.adminRoles, APP_PATHS.adminRoles, <AdminRolesContainer />);

    expect(await screen.findByTestId(TEST_IDS.adminRolesError, {}, WAIT)).toBeInTheDocument();
  });
});
