import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { AdminRolesContainer } from '@/modules/admin/containers/admin-roles.container';
import { APP_PATHS, TEST_IDS } from '@/shared/config';
import { MOCK_PERSONA_EMAILS } from '@/tests/msw/mock-data.constants';

import {
  apiUrl,
  retryFromErrorState,
  registerIntegrationSession,
} from '../setup/integration-api.helper';
import { signInAs } from '../setup/integration-session.helper';
import {
  fireIonChange,
  fireIonCheckboxChange,
  fireIonInput,
  fireIonInputCleared,
} from '../setup/ionic-events.helper';
import { mockApiServer } from '../setup/msw-server.setup';
import { renderRoute } from '../setup/render-with-providers.helper';
import { nestErrorResponse } from '@/tests/msw/nest-error.helper';

const WAIT = { timeout: 5000 };

function useRoles(roles: readonly string[], assignableRoles: readonly string[]): void {
  mockApiServer.use(
    http.get(apiUrl('/teams/:teamId/members/:membershipId/roles'), ({ params }) =>
      HttpResponse.json({
        membershipId: String(params['membershipId']),
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

/** Give the audited reason and commit the draft. */
async function saveWithReason(): Promise<void> {
  fireIonInput(screen.getByTestId(TEST_IDS.adminRolesReason), 'Promoted after the AGM');
  await waitFor(() => {
    expect(screen.getByTestId(TEST_IDS.adminRolesSave)).toBeEnabled();
  }, WAIT);
  fireEvent.click(screen.getByTestId(TEST_IDS.adminRolesSave));
}

registerIntegrationSession();

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
      http.put(
        apiUrl('/teams/:teamId/members/:membershipId/roles'),
        async ({ request, params }) => {
          submitted = await request.json();
          return HttpResponse.json({
            membershipId: String(params['membershipId']),
            roles: ['member', 'coach'],
            assignableRoles: ['member', 'coach'],
          });
        },
      ),
    );
    await openRoles();
    await selectFirstMember();

    const coach = within(screen.getByTestId(TEST_IDS.adminRolesAssignable)).getAllByTestId(
      TEST_IDS.adminRolesToggle,
    )[1]!;
    fireIonCheckboxChange(coach, true);
    await saveWithReason();

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

describe('a rejected assignment is reported', () => {
  it('keeps showing the real roles after a 409 accountRequired refusal', async () => {
    // Recovery audit P0-3: after this exact failure the panel used to keep the
    // optimistic draft and read "Current roles: Coach" as if the save worked.
    useRoles(['member'], ['member', 'coach']);
    mockApiServer.use(
      http.put(apiUrl('/teams/:teamId/members/:membershipId/roles'), () =>
        nestErrorResponse({
          statusCode: 409,
          code: 'CONFLICT',
          message: 'This member has no linked account yet, so roles cannot be assigned',
          path: '/api/v1/teams/team-1/members/mem-omar/roles',
          messageKey: 'errors.members.accountRequired',
        }),
      ),
    );
    await openRoles();
    await selectFirstMember();

    const coach = within(screen.getByTestId(TEST_IDS.adminRolesAssignable)).getAllByTestId(
      TEST_IDS.adminRolesToggle,
    )[1]!;
    fireIonCheckboxChange(coach, true);
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminRolesCurrent)).toHaveTextContent('Member · Coach');
    }, WAIT);

    await saveWithReason();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminRolesCurrent)).toHaveTextContent('Member');
      expect(screen.getByTestId(TEST_IDS.adminRolesCurrent)).not.toHaveTextContent('Coach');
    }, WAIT);
    await waitFor(() => {
      expect(
        within(screen.getByTestId(TEST_IDS.adminRolesAssignable)).getAllByTestId(
          TEST_IDS.adminRolesToggle,
        )[1],
      ).not.toBeChecked();
    }, WAIT);
  });

  it('keeps the panel usable when the server refuses the change', async () => {
    useRoles(['member'], ['member', 'coach']);
    mockApiServer.use(
      http.put(apiUrl('/teams/:teamId/members/:membershipId/roles'), () =>
        HttpResponse.json({ bad: true }, { status: 403 }),
      ),
    );
    await openRoles();
    await selectFirstMember();

    await saveWithReason();

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminRolesPanel)).toBeInTheDocument();
    }, WAIT);
  });
});

describe('clearing the reason', () => {
  it('treats a cleared reason as empty and blocks the save', async () => {
    useRoles(['member'], ['member', 'coach']);
    await openRoles();
    await selectFirstMember();

    fireIonInput(screen.getByTestId(TEST_IDS.adminRolesReason), 'Promoted after the AGM');
    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminRolesSave)).toBeEnabled();
    }, WAIT);

    fireIonInputCleared(screen.getByTestId(TEST_IDS.adminRolesReason));

    await waitFor(() => {
      expect(screen.getByTestId(TEST_IDS.adminRolesSave)).toBeDisabled();
    }, WAIT);
    expect(screen.getByTestId(TEST_IDS.adminRolesPanel)).toHaveTextContent('Give a reason');
  });
});

describe('a failed read offers a retry', () => {
  it('re-issues the member directory from the designed error state', async () => {
    const attempts = await retryFromErrorState({
      path: '/teams/:teamId/members',
      errorTestId: TEST_IDS.adminRolesError,
      signIn: async () => {
        await signInAs(MOCK_PERSONA_EMAILS.admin);
      },
      render: () => {
        renderRoute(APP_PATHS.adminRoles, APP_PATHS.adminRoles, <AdminRolesContainer />);
      },
    });

    expect(attempts.after).toBeGreaterThan(attempts.before);
  });
});
