import { act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHookWithProviders } from '../../../../tests/setup/render-with-providers.helper';
import { assignGroupMembers } from '../services/assign-group-members.service';
import { copyAgenda } from '../services/copy-agenda.service';
import { createGroup } from '../services/create-group.service';
import { removeGroup } from '../services/remove-group.service';
import { removeGroupMember } from '../services/remove-group-member.service';
import { useAssignGroupMembersMutation } from './use-assign-group-members-mutation.hook';
import { useCopyAgendaMutation } from './use-copy-agenda-mutation.hook';
import { useCreateGroupMutation } from './use-create-group-mutation.hook';
import { useRemoveGroupMutation } from './use-remove-group-mutation.hook';
import { useRemoveGroupMemberMutation } from './use-remove-group-member-mutation.hook';

vi.mock('../services/create-group.service', () => ({ createGroup: vi.fn() }));
vi.mock('../services/remove-group.service', () => ({ removeGroup: vi.fn() }));
vi.mock('../services/assign-group-members.service', () => ({ assignGroupMembers: vi.fn() }));
vi.mock('../services/remove-group-member.service', () => ({ removeGroupMember: vi.fn() }));
vi.mock('../services/copy-agenda.service', () => ({ copyAgenda: vi.fn() }));

const SCOPE = { teamId: 't1', sessionId: 's1' };
const GROUP = {
  id: 'group-1',
  name: 'Reds',
  color: null,
  coachMembershipId: null,
  position: 1,
  notes: null,
  members: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createGroup).mockResolvedValue(GROUP);
  vi.mocked(removeGroup).mockResolvedValue(undefined);
  vi.mocked(assignGroupMembers).mockResolvedValue(GROUP);
  vi.mocked(removeGroupMember).mockResolvedValue(undefined);
  vi.mocked(copyAgenda).mockResolvedValue({
    sessionId: 's1',
    agendaId: 'agenda-1',
    status: 'published',
    theme: null,
    notes: null,
    publishedAt: null,
    completedAt: null,
    version: 5,
  });
});

describe('useCreateGroupMutation', () => {
  it('creates a group with every field the command carried', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useCreateGroupMutation(SCOPE, { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run({ name: 'Reds', color: '#ef4444', coachMembershipId: null, notes: null });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(createGroup).toHaveBeenCalledWith({
      teamId: 't1',
      sessionId: 's1',
      name: 'Reds',
      color: '#ef4444',
      coachMembershipId: null,
      notes: null,
    });
  });

  it('reports a refused create', async () => {
    vi.mocked(createGroup).mockRejectedValue(new Error('boom'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useCreateGroupMutation(SCOPE, { onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run({ name: 'Reds', color: null, coachMembershipId: null, notes: null });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('useRemoveGroupMutation', () => {
  it('removes the group by its own id', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useRemoveGroupMutation(SCOPE, { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run({ groupId: 'group-1' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(removeGroup).toHaveBeenCalledWith({ teamId: 't1', sessionId: 's1', groupId: 'group-1' });
  });

  it('reports a refused removal', async () => {
    vi.mocked(removeGroup).mockRejectedValue(new Error('boom'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useRemoveGroupMutation(SCOPE, { onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run({ groupId: 'group-1' });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('useAssignGroupMembersMutation', () => {
  it('assigns every membership id the command carried', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useAssignGroupMembersMutation(SCOPE, { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run({ groupId: 'group-1', membershipIds: ['membership-1'] });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(assignGroupMembers).toHaveBeenCalledWith({
      teamId: 't1',
      sessionId: 's1',
      groupId: 'group-1',
      membershipIds: ['membership-1'],
    });
  });

  it('reports a refused assignment', async () => {
    vi.mocked(assignGroupMembers).mockRejectedValue(new Error('boom'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useAssignGroupMembersMutation(SCOPE, { onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run({ groupId: 'group-1', membershipIds: ['membership-1'] });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('useRemoveGroupMemberMutation', () => {
  it('removes one membership from its own group', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useRemoveGroupMemberMutation(SCOPE, { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run({ groupId: 'group-1', membershipId: 'membership-1' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(removeGroupMember).toHaveBeenCalledWith({
      teamId: 't1',
      sessionId: 's1',
      groupId: 'group-1',
      membershipId: 'membership-1',
    });
  });

  it('reports a refused removal', async () => {
    vi.mocked(removeGroupMember).mockRejectedValue(new Error('boom'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useRemoveGroupMemberMutation(SCOPE, { onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run({ groupId: 'group-1', membershipId: 'membership-1' });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('useCopyAgendaMutation', () => {
  it('copies from the source session the command carried', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useCopyAgendaMutation(SCOPE, { onSuccess, onError: vi.fn() }),
    );

    act(() => {
      result.current.run({ sourceSessionId: 's2' });
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    expect(copyAgenda).toHaveBeenCalledWith({
      teamId: 't1',
      sessionId: 's1',
      sourceSessionId: 's2',
    });
  });

  it('reports a refused copy', async () => {
    vi.mocked(copyAgenda).mockRejectedValue(new Error('boom'));
    const onError = vi.fn();
    const { result } = renderHookWithProviders(() =>
      useCopyAgendaMutation(SCOPE, { onSuccess: vi.fn(), onError }),
    );

    act(() => {
      result.current.run({ sourceSessionId: 's2' });
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });
});
