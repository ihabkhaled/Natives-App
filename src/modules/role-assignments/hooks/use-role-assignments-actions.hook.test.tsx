import { act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { confirmResult, withConfirmStub } from '../../../../tests/setup/confirm-alert-stub.helper';
import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { assignRole } from '../services/assign-role.service';
import { revokeAssignment } from '../services/revoke-assignment.service';
import { useRoleAssignmentsActions } from './use-role-assignments-actions.hook';

vi.mock('../services/assign-role.service', () => ({ assignRole: vi.fn() }));
vi.mock('../services/revoke-assignment.service', () => ({ revokeAssignment: vi.fn() }));
vi.mock('@/shared/ui', async (importOriginal) =>
  withConfirmStub(await importOriginal<Record<string, unknown>>()),
);

const t = (key: string): string => `t:${key}`;
const SCOPE = { teamId: 'team-1', seasonId: null } as const;

interface ActionsResult {
  readonly current: ReturnType<typeof useRoleAssignmentsActions>;
}

function renderActions(): ReturnType<
  typeof renderHookWithProviders<ReturnType<typeof useRoleAssignmentsActions>>
> {
  return renderHookWithProviders(() => useRoleAssignmentsActions(t, SCOPE));
}

/** The row summary a real revoke would carry: who, which role, which scope. */
const REVOKE_SENTENCE = 'user-1 · Coach · team-1';

function revoke(result: ActionsResult): void {
  act(() => {
    result.current.confirmRevoke('assignment-1', REVOKE_SENTENCE);
  });
}

function grant(result: ActionsResult): void {
  act(() => {
    result.current.onGrant({ userId: 'user-1', roleKey: 'COACH' });
  });
}

beforeEach(() => {
  confirmResult.value = true;
  vi.mocked(assignRole).mockResolvedValue({} as never);
  vi.mocked(revokeAssignment).mockResolvedValue(true);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('useRoleAssignmentsActions', () => {
  it('starts with nothing to report', () => {
    expect(renderActions().result.current.notice).toBeNull();
  });

  it('revokes only after the administrator confirms', async () => {
    const { result } = renderActions();

    revoke(result);

    await waitFor(() => {
      expect(revokeAssignment).toHaveBeenCalledWith('assignment-1');
    });
  });

  it('leaves the access alone when the confirmation is dismissed', async () => {
    confirmResult.value = false;
    const { result } = renderActions();

    revoke(result);

    // A dismissed dialog is a decision, not an oversight — nothing is removed.
    await waitFor(() => {
      expect(revokeAssignment).not.toHaveBeenCalled();
    });
  });

  it('grants without a second confirmation, because a grant is reversible', async () => {
    const { result } = renderActions();

    grant(result);

    await waitFor(() => {
      expect(assignRole).toHaveBeenCalledWith({
        userId: 'user-1',
        roleKey: 'COACH',
        teamId: 'team-1',
        seasonId: null,
      });
    });
  });

  it('says the action did not happen, never how the server phrased it', async () => {
    vi.mocked(revokeAssignment).mockRejectedValue(new Error('privilege ceiling exceeded'));
    const { result } = renderActions();

    revoke(result);

    // A raw RBAC refusal reads like an accusation and leaks the policy shape.
    await waitFor(() => {
      expect(result.current.notice).toBe('t:roleAssignments.actionFailed');
    });
  });

  it('reports a refused grant the same single way', async () => {
    vi.mocked(assignRole).mockRejectedValue(new Error('boom'));
    const { result } = renderActions();

    grant(result);

    await waitFor(() => {
      expect(result.current.notice).toBe('t:roleAssignments.actionFailed');
    });
  });

  it('clears a stale failure once a command succeeds', async () => {
    vi.mocked(assignRole).mockRejectedValueOnce(new Error('boom'));
    const { result } = renderActions();

    grant(result);
    await waitFor(() => {
      expect(result.current.notice).not.toBeNull();
    });

    grant(result);

    await waitFor(() => {
      expect(result.current.notice).toBeNull();
    });
  });

  it('marks a command in flight so the screen can hold the affordance still', async () => {
    vi.mocked(revokeAssignment).mockImplementation(() => new Promise(() => undefined));
    const { result } = renderActions();

    revoke(result);

    await waitFor(() => {
      expect(result.current.isRevoking).toBe(true);
    });
  });

  it('marks a grant in flight too', async () => {
    vi.mocked(assignRole).mockImplementation(() => new Promise(() => undefined));
    const { result } = renderActions();

    grant(result);

    await waitFor(() => {
      expect(result.current.isGranting).toBe(true);
    });
  });
});
