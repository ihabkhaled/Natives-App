import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildAgendaGroupsFormsStub as buildForms } from '../../../../tests/factories/practice-agenda-groups-forms.factory';
import { useAssignGroupMembersMutation } from '../mutations/use-assign-group-members-mutation.hook';
import { useCopyAgendaMutation } from '../mutations/use-copy-agenda-mutation.hook';
import { useCreateGroupMutation } from '../mutations/use-create-group-mutation.hook';
import { useRemoveGroupMutation } from '../mutations/use-remove-group-mutation.hook';
import { useRemoveGroupMemberMutation } from '../mutations/use-remove-group-member-mutation.hook';
import type { AgendaGroupsMutationCallbacks } from '../mutations/practice-agenda-groups-mutations.types';
import { useAgendaGroupsMutations } from './use-agenda-groups-mutations.hook';

vi.mock('../mutations/use-create-group-mutation.hook', () => ({
  useCreateGroupMutation: vi.fn(),
}));
vi.mock('../mutations/use-remove-group-mutation.hook', () => ({
  useRemoveGroupMutation: vi.fn(),
}));
vi.mock('../mutations/use-assign-group-members-mutation.hook', () => ({
  useAssignGroupMembersMutation: vi.fn(),
}));
vi.mock('../mutations/use-remove-group-member-mutation.hook', () => ({
  useRemoveGroupMemberMutation: vi.fn(),
}));
vi.mock('../mutations/use-copy-agenda-mutation.hook', () => ({
  useCopyAgendaMutation: vi.fn(),
}));

const translate = (key: string): string => key;

let createCallbacks: AgendaGroupsMutationCallbacks;
let removeGroupCallbacks: AgendaGroupsMutationCallbacks;
let assignCallbacks: AgendaGroupsMutationCallbacks;
let removeMemberCallbacks: AgendaGroupsMutationCallbacks;
let copyCallbacks: AgendaGroupsMutationCallbacks;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useCreateGroupMutation).mockImplementation((_scope, callbacks) => {
    createCallbacks = callbacks;
    return { run: vi.fn(), isRunning: false };
  });
  vi.mocked(useRemoveGroupMutation).mockImplementation((_scope, callbacks) => {
    removeGroupCallbacks = callbacks;
    return { run: vi.fn(), isRunning: false };
  });
  vi.mocked(useAssignGroupMembersMutation).mockImplementation((_scope, callbacks) => {
    assignCallbacks = callbacks;
    return { run: vi.fn(), isRunning: false };
  });
  vi.mocked(useRemoveGroupMemberMutation).mockImplementation((_scope, callbacks) => {
    removeMemberCallbacks = callbacks;
    return { run: vi.fn(), isRunning: false };
  });
  vi.mocked(useCopyAgendaMutation).mockImplementation((_scope, callbacks) => {
    copyCallbacks = callbacks;
    return { run: vi.fn(), isRunning: false };
  });
});

const SCOPE = { teamId: 't1', sessionId: 's1' };

describe('useAgendaGroupsMutations', () => {
  it('starts with no notice', () => {
    const { result } = renderHook(() => useAgendaGroupsMutations(translate, SCOPE, buildForms()));

    expect(result.current.notice).toBeNull();
  });

  it('resets the create form and reports the outcome once a group is created', () => {
    const forms = buildForms();
    const { result, rerender } = renderHook(() =>
      useAgendaGroupsMutations(translate, SCOPE, forms),
    );

    createCallbacks.onSuccess();
    rerender();

    expect(forms.resetCreateForm).toHaveBeenCalledTimes(1);
    expect(result.current.notice).toBe('practiceAgendaGroups.groupCreated');
  });

  it('reports a group removal', () => {
    const { result, rerender } = renderHook(() =>
      useAgendaGroupsMutations(translate, SCOPE, buildForms()),
    );

    removeGroupCallbacks.onSuccess();
    rerender();

    expect(result.current.notice).toBe('practiceAgendaGroups.groupRemoved');
  });

  it('resets the copy form and reports the outcome once an agenda is copied', () => {
    const forms = buildForms();
    const { result, rerender } = renderHook(() =>
      useAgendaGroupsMutations(translate, SCOPE, forms),
    );

    copyCallbacks.onSuccess();
    rerender();

    expect(forms.resetCopyForm).toHaveBeenCalledTimes(1);
    expect(result.current.notice).toBe('practiceAgendaGroups.agendaCopied');
  });

  it('reports a member removal', () => {
    const { result, rerender } = renderHook(() =>
      useAgendaGroupsMutations(translate, SCOPE, buildForms()),
    );

    removeMemberCallbacks.onSuccess();
    rerender();

    expect(result.current.notice).toBe('practiceAgendaGroups.memberRemoved');
  });

  /**
   * `runAssignMembers` records which group the call was for, so the
   * mutation's own success callback — which receives no argument — can clear
   * that one group's field instead of every group's.
   */
  it("clears the group's own add-member field once its member is added", () => {
    const forms = buildForms();
    const { result, rerender } = renderHook(() =>
      useAgendaGroupsMutations(translate, SCOPE, forms),
    );

    result.current.runAssignMembers('group-1', ['membership-1']);
    assignCallbacks.onSuccess();
    rerender();

    expect(forms.resetAddMemberValue).toHaveBeenCalledWith('group-1');
    expect(result.current.notice).toBe('practiceAgendaGroups.memberAdded');
  });

  /**
   * Nothing has recorded a pending group when the assign mutation succeeds
   * without ever being run through `runAssignMembers` first — an unreachable
   * case in practice, but the outcome must still not crash reaching for a
   * field to clear.
   */
  it('reports a member added even when no group was recorded as pending', () => {
    const forms = buildForms();
    const { result, rerender } = renderHook(() =>
      useAgendaGroupsMutations(translate, SCOPE, forms),
    );

    assignCallbacks.onSuccess();
    rerender();

    expect(forms.resetAddMemberValue).not.toHaveBeenCalled();
    expect(result.current.notice).toBe('practiceAgendaGroups.memberAdded');
  });

  it('reports every failure the same way, regardless of which command failed', () => {
    const { result, rerender } = renderHook(() =>
      useAgendaGroupsMutations(translate, SCOPE, buildForms()),
    );

    createCallbacks.onError(new Error('nope'));
    rerender();
    expect(result.current.notice).toBe('practiceAgendaGroups.actionFailed');

    removeGroupCallbacks.onError(new Error('nope'));
    rerender();
    expect(result.current.notice).toBe('practiceAgendaGroups.actionFailed');
  });

  it('reflects an assign-members mutation in flight', () => {
    vi.mocked(useAssignGroupMembersMutation).mockImplementation((_scope, callbacks) => {
      assignCallbacks = callbacks;
      return { run: vi.fn(), isRunning: true };
    });

    const { result } = renderHook(() => useAgendaGroupsMutations(translate, SCOPE, buildForms()));

    expect(result.current.isAssigningMembers).toBe(true);
  });
});
