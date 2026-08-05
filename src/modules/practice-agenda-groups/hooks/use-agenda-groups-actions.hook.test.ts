import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useConfirmAlert, type ShowConfirmAlertOptions } from '@/shared/ui';

import { buildAgendaGroupsFormsStub as buildForms } from '../../../../tests/factories/practice-agenda-groups-forms.factory';
import { useAgendaGroupsActions } from './use-agenda-groups-actions.hook';
import { useAgendaGroupsMutations } from './use-agenda-groups-mutations.hook';

vi.mock('@/shared/ui', () => ({ useConfirmAlert: vi.fn() }));
vi.mock('./use-agenda-groups-mutations.hook', () => ({ useAgendaGroupsMutations: vi.fn() }));

const translate = (key: string): string => key;
const SCOPE = { teamId: 't1', sessionId: 's1' };

let mutations: {
  notice: string | null;
  createGroup: { run: ReturnType<typeof vi.fn>; isRunning: boolean };
  removeGroup: { run: ReturnType<typeof vi.fn>; isRunning: boolean };
  isAssigningMembers: boolean;
  runAssignMembers: ReturnType<typeof vi.fn>;
  removeMember: { run: ReturnType<typeof vi.fn>; isRunning: boolean };
  copyAgenda: { run: ReturnType<typeof vi.fn>; isRunning: boolean };
};

let confirmMock: ReturnType<typeof vi.fn<(options: ShowConfirmAlertOptions) => Promise<boolean>>>;

beforeEach(() => {
  vi.clearAllMocks();
  mutations = {
    notice: null,
    createGroup: { run: vi.fn(), isRunning: false },
    removeGroup: { run: vi.fn(), isRunning: false },
    isAssigningMembers: false,
    runAssignMembers: vi.fn(),
    removeMember: { run: vi.fn(), isRunning: false },
    copyAgenda: { run: vi.fn(), isRunning: false },
  };
  vi.mocked(useAgendaGroupsMutations).mockImplementation(() => mutations as never);
  confirmMock = vi
    .fn<(options: ShowConfirmAlertOptions) => Promise<boolean>>()
    .mockResolvedValue(true);
  vi.mocked(useConfirmAlert).mockReturnValue({ confirm: confirmMock });
});

describe('useAgendaGroupsActions', () => {
  it('refuses to submit a create with no name typed', () => {
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, buildForms()));

    result.current.onCreateSubmit();

    expect(mutations.createGroup.run).not.toHaveBeenCalled();
  });

  it('trims the name and drops every empty optional field', () => {
    const forms = buildForms({
      createForm: { name: '  Reds  ', color: '', coachMembershipId: '  ', notes: '' },
    });
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, forms));

    result.current.onCreateSubmit();

    expect(mutations.createGroup.run).toHaveBeenCalledWith({
      name: 'Reds',
      color: null,
      coachMembershipId: null,
      notes: null,
    });
  });

  it('carries every optional field through once it is filled in', () => {
    const forms = buildForms({
      createForm: { name: 'Reds', color: '#ef4444', coachMembershipId: 'm-3', notes: 'Attackers' },
    });
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, forms));

    result.current.onCreateSubmit();

    expect(mutations.createGroup.run).toHaveBeenCalledWith({
      name: 'Reds',
      color: '#ef4444',
      coachMembershipId: 'm-3',
      notes: 'Attackers',
    });
  });

  it('refuses to submit a copy with no source session id typed', () => {
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, buildForms()));

    result.current.onCopySubmit();

    expect(mutations.copyAgenda.run).not.toHaveBeenCalled();
  });

  it('trims the source session id before copying', () => {
    const forms = buildForms({ copySourceSessionId: '  s2  ' });
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, forms));

    result.current.onCopySubmit();

    expect(mutations.copyAgenda.run).toHaveBeenCalledWith({ sourceSessionId: 's2' });
  });

  it('refuses to add a member with nothing typed for that group', () => {
    const forms = buildForms({ addMemberValues: { 'group-1': '' } });
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, forms));

    result.current.onAddMember('group-1');

    expect(mutations.runAssignMembers).not.toHaveBeenCalled();
  });

  it('refuses to add a member for a group with no recorded value at all', () => {
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, buildForms()));

    result.current.onAddMember('group-with-no-draft-yet');

    expect(mutations.runAssignMembers).not.toHaveBeenCalled();
  });

  it('trims a typed membership id and adds it as a single-item list', () => {
    const forms = buildForms({ addMemberValues: { 'group-1': '  membership-9  ' } });
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, forms));

    result.current.onAddMember('group-1');

    expect(mutations.runAssignMembers).toHaveBeenCalledWith('group-1', ['membership-9']);
  });

  it('runs a group removal only once the coach confirms', async () => {
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, buildForms()));

    result.current.onRemoveGroup('group-1');
    await Promise.resolve();

    expect(confirmMock).toHaveBeenCalledWith({
      header: 'practiceAgendaGroups.removeGroupConfirmTitle',
      message: 'practiceAgendaGroups.removeGroupConfirmMessage',
      cancelLabel: 'practiceAgendaGroups.confirmCancel',
      confirmLabel: 'practiceAgendaGroups.confirmProceed',
    });
    expect(mutations.removeGroup.run).toHaveBeenCalledWith({ groupId: 'group-1' });
  });

  it('never removes a group the coach backs out of', async () => {
    confirmMock.mockResolvedValue(false);
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, buildForms()));

    result.current.onRemoveGroup('group-1');
    await Promise.resolve();

    expect(mutations.removeGroup.run).not.toHaveBeenCalled();
  });

  it('runs a member removal only once the coach confirms', async () => {
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, buildForms()));

    result.current.onRemoveMember('group-1', 'membership-1');
    await Promise.resolve();

    expect(confirmMock).toHaveBeenCalledWith({
      header: 'practiceAgendaGroups.removeMemberConfirmTitle',
      message: 'practiceAgendaGroups.removeMemberConfirmMessage',
      cancelLabel: 'practiceAgendaGroups.confirmCancel',
      confirmLabel: 'practiceAgendaGroups.confirmProceed',
    });
    expect(mutations.removeMember.run).toHaveBeenCalledWith({
      groupId: 'group-1',
      membershipId: 'membership-1',
    });
  });

  it('reports mutating while any one command is in flight', () => {
    mutations.removeMember.isRunning = true;
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, buildForms()));

    expect(result.current.isMutating).toBe(true);
  });

  it('passes the shared notice straight through', () => {
    mutations.notice = 'Group created.';
    const { result } = renderHook(() => useAgendaGroupsActions(translate, SCOPE, buildForms()));

    expect(result.current.notice).toBe('Group created.');
  });
});
