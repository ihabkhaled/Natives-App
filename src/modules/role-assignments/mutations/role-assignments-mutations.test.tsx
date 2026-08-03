import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { assignRole } from '../services/assign-role.service';
import { revokeAssignment } from '../services/revoke-assignment.service';
import { useAssignRoleMutation } from './use-assign-role-mutation.hook';
import { useRevokeAssignmentMutation } from './use-revoke-assignment-mutation.hook';

vi.mock('../services/assign-role.service', () => ({ assignRole: vi.fn() }));
vi.mock('../services/revoke-assignment.service', () => ({ revokeAssignment: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(assignRole).mockResolvedValue({} as never);
  vi.mocked(revokeAssignment).mockResolvedValue(true);
});

describe('useAssignRoleMutation', () => {
  it('stamps the screen’s own team scope onto the grant', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useAssignRoleMutation(
        { teamId: 'team-1', seasonId: 'season-1' },
        { onSuccess, onError: vi.fn() },
      ),
    );

    act(() => {
      result.current.run({ userId: 'user-1', roleKey: 'COACH' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    // The caller never chooses the scope: this screen cannot mint a
    // platform-wide grant, so teamId always travels with the command.
    expect(assignRole).toHaveBeenCalledWith({
      userId: 'user-1',
      roleKey: 'COACH',
      teamId: 'team-1',
      seasonId: 'season-1',
    });
  });

  it('reports a refusal instead of leaving the form silent', async () => {
    vi.mocked(assignRole).mockRejectedValue(new Error('ceiling'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useAssignRoleMutation({ teamId: 'team-1', seasonId: null }, { onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run({ userId: 'user-1', roleKey: 'COACH' });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('useRevokeAssignmentMutation', () => {
  it('revokes the assignment it was given', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useRevokeAssignmentMutation({ onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run('assignment-1');
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(revokeAssignment).toHaveBeenCalledWith('assignment-1');
  });

  it('reports a refusal rather than pretending the access is gone', async () => {
    vi.mocked(revokeAssignment).mockRejectedValue(new Error('boom'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useRevokeAssignmentMutation({ onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run('assignment-1');
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});
