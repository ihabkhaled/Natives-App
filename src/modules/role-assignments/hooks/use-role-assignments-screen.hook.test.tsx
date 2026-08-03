// jscpd:ignore-start
// vitest hoists a vi.mock factory to the top of the file that declares it,
// so neither the factory nor the imports it needs can move into a shared
// helper. Only the payloads could, and they now come from
// tests/setup/screen-grants.helper.ts.
import {
  buildEffectivePermissions,
  buildTeamScope,
} from '../../../../tests/setup/screen-grants.helper';
import { act, waitFor } from '@testing-library/react';
// Must be imported before `@/platform`, whose module factory below reads it.
import { createPlatformMock } from '../../../../tests/setup/platform-mock.helper';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import type * as AuthModule from '@/modules/auth';
import { useActiveTeamScope, useEffectivePermissions } from '@/modules/auth';
import { useNetworkStatus } from '@/platform';
import { PERMISSIONS } from '@/shared/security';
import {
  MOCK_ASSIGNABLE_ROLES,
  MOCK_ASSIGNMENT_USER_ID,
  MOCK_ROLE_ASSIGNMENTS,
} from '@/tests/msw/role-assignments.fixture';

import { initTestI18n } from '../../../../tests/setup/i18n-test.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { assignRole } from '../services/assign-role.service';
import { listAssignableRoles } from '../services/list-assignable-roles.service';
import { listUserAssignments } from '../services/list-user-assignments.service';
import { revokeAssignment } from '../services/revoke-assignment.service';
import { useRoleAssignmentsScreen } from './use-role-assignments-screen.hook';

vi.mock('../services/list-user-assignments.service', () => ({ listUserAssignments: vi.fn() }));
vi.mock('../services/list-assignable-roles.service', () => ({ listAssignableRoles: vi.fn() }));
vi.mock('../services/assign-role.service', () => ({ assignRole: vi.fn() }));
vi.mock('../services/revoke-assignment.service', () => ({ revokeAssignment: vi.fn() }));

vi.mock('@/platform', () => createPlatformMock());
// Inlined rather than shared: the stub helper module is not yet initialized
// when this factory runs, because `@/shared/ui` is pulled in transitively by
// the `@/modules/auth` mock below. Declining a confirmation is covered by the
// actions spec; here every dialog is accepted.
vi.mock('@/shared/ui', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useConfirmAlert: () => ({ confirm: () => Promise.resolve(true) }) };
});
vi.mock('@/modules/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof AuthModule>();
  return { ...actual, useActiveTeamScope: vi.fn(), useEffectivePermissions: vi.fn() };
});
// jscpd:ignore-end

/** Managing roles is one grant; there is no read-only variant to model. */
function mockGrants(
  permissions: readonly string[] = [PERMISSIONS.memberRolesManage],
  isLoading = false,
): void {
  vi.mocked(useActiveTeamScope).mockReturnValue(
    buildTeamScope({ isLoading, seasonId: 'season-2026' }),
  );
  vi.mocked(useEffectivePermissions).mockReturnValue(buildEffectivePermissions(permissions));
}

function renderScreen(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useRoleAssignmentsScreen>>
> {
  return renderHookWithProviders(() => useRoleAssignmentsScreen(), {
    initialPath: '/admin/role-assignments',
  });
}

type ScreenView = ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useRoleAssignmentsScreen>>
>;

/** Type the given user id into the target field. */
function nameTarget(view: ScreenView, userId: string): ScreenView {
  act(() => {
    view.result.current.onTargetChange(userId);
  });
  return view;
}

/** Name the fixture user and wait for their assignments to land. */
async function renderWithTarget(): Promise<ScreenView> {
  const view = nameTarget(renderScreen(), MOCK_ASSIGNMENT_USER_ID);
  await waitFor(() => {
    expect(view.result.current.status).toBe('ready');
  });
  return view;
}

/** A target who currently holds nothing at all. */
function renderWithEmptyTarget(): ScreenView {
  vi.mocked(listUserAssignments).mockResolvedValue({ userId: 'user-2', assignments: [] });
  return nameTarget(renderScreen(), 'user-2');
}

beforeAll(async () => {
  await initTestI18n();
});

beforeEach(() => {
  vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: true });
  mockGrants();
  vi.mocked(listUserAssignments).mockResolvedValue({
    userId: MOCK_ASSIGNMENT_USER_ID,
    assignments: [...MOCK_ROLE_ASSIGNMENTS],
  });
  vi.mocked(listAssignableRoles).mockResolvedValue(MOCK_ASSIGNABLE_ROLES);
  vi.mocked(assignRole).mockResolvedValue({} as never);
  vi.mocked(revokeAssignment).mockResolvedValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useRoleAssignmentsScreen', () => {
  it('rests in its empty state until a target user is named', () => {
    const { result } = renderScreen();

    // No request was made, so there is nothing to spin on.
    expect(result.current.status).toBe('empty');
    expect(listUserAssignments).not.toHaveBeenCalled();
  });

  it('offers no grant form before a target exists', () => {
    expect(renderScreen().result.current.grant).toBeNull();
  });

  it('reads the named user’s assignments', async () => {
    await renderWithTarget();

    expect(listUserAssignments).toHaveBeenCalledWith(MOCK_ASSIGNMENT_USER_ID);
  });

  it('trims the typed user id before it becomes a path segment', async () => {
    const { result } = nameTarget(renderScreen(), '  user-1  ');

    await waitFor(() => {
      expect(listUserAssignments).toHaveBeenCalledWith('user-1');
    });
    // The field keeps what was typed; only the request is normalized.
    expect(result.current.targetValue).toBe('  user-1  ');
  });

  it('leads with the platform-wide grant and counts every row', async () => {
    const { result } = await renderWithTarget();

    expect(result.current.rows[0]?.scopeLabel).toBe('Platform');
    expect(result.current.countLabel).toContain('4');
  });

  it('refuses to revoke a platform-wide grant from this screen', async () => {
    const { result } = await renderWithTarget();

    // That grant belongs to the audited super-admin flow in modules/admin.
    expect(result.current.rows[0]?.canRevoke).toBe(false);
  });

  it('names whose access is ending before anything is removed', async () => {
    const { result } = await renderWithTarget();
    const row = result.current.rows.find((entry) => entry.canRevoke);

    expect(row?.confirmMessage).toContain(MOCK_ASSIGNMENT_USER_ID);
    expect(row?.confirmMessage).toContain(row?.scopeLabel ?? '');

    act(() => {
      row?.onRevoke();
    });

    await waitFor(() => {
      expect(revokeAssignment).toHaveBeenCalledWith(row?.id);
    });
  });

  it('grants only a role the server offered, in the active team scope', async () => {
    const { result } = await renderWithTarget();

    await waitFor(() => {
      expect(result.current.grant?.options).toHaveLength(3);
    });
    act(() => {
      result.current.grant?.onRoleChange('coach');
    });
    await waitFor(() => {
      expect(result.current.grant?.canSubmit).toBe(true);
    });
    act(() => {
      result.current.grant?.onSubmit();
    });

    await waitFor(() => {
      expect(assignRole).toHaveBeenCalledWith({
        userId: MOCK_ASSIGNMENT_USER_ID,
        roleKey: 'COACH',
        teamId: 'team-1',
        seasonId: 'season-2026',
      });
    });
  });

  it('reports a refused command in one sentence', async () => {
    vi.mocked(revokeAssignment).mockRejectedValue(new Error('privilege ceiling exceeded'));
    const { result } = await renderWithTarget();
    const row = result.current.rows.find((entry) => entry.canRevoke);

    act(() => {
      row?.onRevoke();
    });

    await waitFor(() => {
      expect(result.current.notice).toBe('That action did not complete. Try again.');
    });
  });

  it('shows the empty state for a user who holds nothing', async () => {
    const { result } = renderWithEmptyTarget();

    await waitFor(() => {
      expect(result.current.status).toBe('empty');
    });
    expect(result.current.emptyTitle).toBe('No assignments yet');
  });

  it('still offers the grant form to a user who holds nothing yet', async () => {
    const { result } = renderWithEmptyTarget();

    await waitFor(() => {
      expect(result.current.grant).not.toBeNull();
    });
  });

  it('waits rather than refusing while the grants are still resolving', () => {
    mockGrants([], true);

    // Forbidden is a verdict; showing it early accuses a permitted admin.
    expect(renderScreen().result.current.status).toBe('loading');
  });

  it('refuses the screen without the role-management grant', () => {
    mockGrants([]);
    const { result } = renderScreen();

    expect(result.current.status).toBe('forbidden');
    expect(result.current.grant).toBeNull();
  });

  it('carries the screen’s own copy for its designed states', () => {
    const { result } = renderScreen();

    expect(result.current.pageTitle).toBe('Role assignments');
    expect(result.current.subtitle).toBe('Who holds which role, and on which team.');
    expect(result.current.listHeading).toBe('Assignments');
  });

  it('blames the connection, not the server, when the read fails offline', async () => {
    vi.mocked(useNetworkStatus).mockReturnValue({ isOnline: false });
    vi.mocked(listUserAssignments).mockRejectedValue(new Error('offline'));
    const { result } = nameTarget(renderScreen(), 'user-1');

    await waitFor(() => {
      expect(result.current.status).toBe('offline');
    });
  });

  it('surfaces a failed read as an error the administrator can retry', async () => {
    vi.mocked(listUserAssignments).mockRejectedValue(new Error('boom'));
    const { result } = nameTarget(renderScreen(), 'user-1');

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });
    expect(() => {
      result.current.onRetry();
    }).not.toThrow();
  });
});
