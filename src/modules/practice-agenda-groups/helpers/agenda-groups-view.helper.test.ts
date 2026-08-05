import { describe, expect, it, vi } from 'vitest';

import type { AgendaGroupsPlan } from '../types/practice-agenda-groups.types';
import {
  buildAgendaGroupsView,
  type AgendaGroupsViewInput,
  type CreateGroupFormState,
} from './agenda-groups-view.helper';

/** Echo the key back with its params, so assertions read as key + numbers. */
const translate = (key: string, params?: Readonly<Record<string, unknown>>): string =>
  params === undefined ? key : `${key}:${JSON.stringify(params)}`;

const EMPTY_CREATE_FORM: CreateGroupFormState = {
  name: '',
  color: '',
  coachMembershipId: '',
  notes: '',
};

function plan(overrides: Partial<AgendaGroupsPlan> = {}): AgendaGroupsPlan {
  return {
    sessionId: 's1',
    agendaId: 'agenda-1',
    status: 'published',
    theme: null,
    notes: null,
    publishedAt: null,
    completedAt: null,
    version: 1,
    blocks: [],
    groups: [
      {
        id: 'group-1',
        name: 'Handlers',
        color: '#3b82f6',
        coachMembershipId: null,
        position: 1,
        notes: null,
        members: [{ membershipId: 'membership-10' }],
      },
    ],
    ...overrides,
  };
}

function input(overrides: Partial<AgendaGroupsViewInput> = {}): AgendaGroupsViewInput {
  return {
    plan: plan(),
    isLoading: false,
    isForbidden: false,
    hasError: false,
    notice: null,
    isMutating: false,
    createForm: EMPTY_CREATE_FORM,
    onCreateFieldChange: vi.fn(),
    onCreateSubmit: vi.fn(),
    copySourceSessionId: '',
    onCopySourceChange: vi.fn(),
    onCopySubmit: vi.fn(),
    addMemberValues: {},
    onAddMemberValueChange: vi.fn(),
    onAddMember: vi.fn(),
    onRemoveMember: vi.fn(),
    onRemoveGroup: vi.fn(),
    ...overrides,
  };
}

describe('buildAgendaGroupsView', () => {
  it('interpolates the raw status value verbatim', () => {
    const view = buildAgendaGroupsView(translate, input());

    expect(view.statusLabel).toBe('practiceAgendaGroups.statusLabel:{"status":"published"}');
  });

  it('shows no status before the plan has loaded', () => {
    const view = buildAgendaGroupsView(translate, input({ plan: undefined }));

    expect(view.statusLabel).toBe('');
    expect(view.blocks).toEqual([]);
    expect(view.groups).toEqual([]);
  });

  it('shows no status while the plan carries none yet', () => {
    const view = buildAgendaGroupsView(translate, input({ plan: plan({ status: null }) }));

    expect(view.statusLabel).toBe('');
  });

  it('orders groups by position and carries their fields through', () => {
    const view = buildAgendaGroupsView(
      translate,
      input({
        plan: plan({
          groups: [
            {
              id: 'g2',
              name: 'Second',
              color: null,
              coachMembershipId: null,
              position: 2,
              notes: null,
              members: [],
            },
            {
              id: 'g1',
              name: 'First',
              color: null,
              coachMembershipId: null,
              position: 1,
              notes: null,
              members: [],
            },
          ],
        }),
      }),
    );

    expect(view.groups.map((group) => group.name)).toEqual(['First', 'Second']);
  });

  it("wires a member's remove control to its own group and membership id", () => {
    const onRemoveMember = vi.fn();
    const view = buildAgendaGroupsView(translate, input({ onRemoveMember }));

    view.groups[0]?.members[0]?.onRemove();

    expect(onRemoveMember).toHaveBeenCalledWith('group-1', 'membership-10');
  });

  it("wires a group's remove control to its own id", () => {
    const onRemoveGroup = vi.fn();
    const view = buildAgendaGroupsView(translate, input({ onRemoveGroup }));

    view.groups[0]?.onRemoveGroup();

    expect(onRemoveGroup).toHaveBeenCalledWith('group-1');
  });

  it('reads the add-member value keyed by group id, defaulting to empty', () => {
    const view = buildAgendaGroupsView(
      translate,
      input({ addMemberValues: { 'group-1': 'membership-99' } }),
    );

    expect(view.groups[0]?.addMemberValue).toBe('membership-99');
  });

  it('routes an add-member value change through the group id', () => {
    const onAddMemberValueChange = vi.fn();
    const view = buildAgendaGroupsView(translate, input({ onAddMemberValueChange }));

    view.groups[0]?.onAddMemberValueChange('membership-2');

    expect(onAddMemberValueChange).toHaveBeenCalledWith('group-1', 'membership-2');
  });

  it('refuses to add a member with nothing typed', () => {
    const view = buildAgendaGroupsView(translate, input({ addMemberValues: { 'group-1': '' } }));

    expect(view.groups[0]?.canAddMember).toBe(false);
  });

  it('allows adding a member once something is typed, unless a command is already running', () => {
    const ready = buildAgendaGroupsView(
      translate,
      input({ addMemberValues: { 'group-1': 'membership-2' } }),
    );
    const busy = buildAgendaGroupsView(
      translate,
      input({ addMemberValues: { 'group-1': 'membership-2' }, isMutating: true }),
    );

    expect(ready.groups[0]?.canAddMember).toBe(true);
    expect(busy.groups[0]?.canAddMember).toBe(false);
    expect(busy.groups[0]?.isAddingMember).toBe(true);
    expect(busy.groups[0]?.isRemovingGroup).toBe(true);
    expect(busy.groups[0]?.members[0]?.isRemoving).toBe(true);
  });

  it('refuses to create a group with no name', () => {
    const view = buildAgendaGroupsView(translate, input());

    expect(view.createForm.canSubmit).toBe(false);
  });

  it('allows creating a group once a name is typed, unless a command is already running', () => {
    const ready = buildAgendaGroupsView(
      translate,
      input({ createForm: { ...EMPTY_CREATE_FORM, name: 'Reds' } }),
    );
    const busy = buildAgendaGroupsView(
      translate,
      input({ createForm: { ...EMPTY_CREATE_FORM, name: 'Reds' }, isMutating: true }),
    );

    expect(ready.createForm.canSubmit).toBe(true);
    expect(busy.createForm.canSubmit).toBe(false);
    expect(busy.createForm.isSaving).toBe(true);
  });

  it('routes each create-form field change through its own key', () => {
    const onCreateFieldChange = vi.fn();
    const view = buildAgendaGroupsView(translate, input({ onCreateFieldChange }));

    view.createForm.onNameChange('Reds');
    view.createForm.onColorChange('#ef4444');
    view.createForm.onCoachChange('membership-3');
    view.createForm.onNotesChange('Attackers');

    expect(onCreateFieldChange).toHaveBeenNthCalledWith(1, 'name', 'Reds');
    expect(onCreateFieldChange).toHaveBeenNthCalledWith(2, 'color', '#ef4444');
    expect(onCreateFieldChange).toHaveBeenNthCalledWith(3, 'coachMembershipId', 'membership-3');
    expect(onCreateFieldChange).toHaveBeenNthCalledWith(4, 'notes', 'Attackers');
  });

  it('translates every colour swatch label', () => {
    const view = buildAgendaGroupsView(translate, input());

    expect(view.createForm.colorOptions).toContainEqual({
      value: '',
      label: 'practiceAgendaGroups.colorNone',
    });
  });

  it('refuses to copy with no source session id', () => {
    const view = buildAgendaGroupsView(translate, input());

    expect(view.copyForm.canSubmit).toBe(false);
  });

  it('allows copying once a source session id is typed, unless a command is already running', () => {
    const ready = buildAgendaGroupsView(translate, input({ copySourceSessionId: 's2' }));
    const busy = buildAgendaGroupsView(
      translate,
      input({ copySourceSessionId: 's2', isMutating: true }),
    );

    expect(ready.copyForm.canSubmit).toBe(true);
    expect(busy.copyForm.canSubmit).toBe(false);
    expect(busy.copyForm.isCopying).toBe(true);
  });

  it('passes the state flags and notice straight through', () => {
    const view = buildAgendaGroupsView(
      translate,
      input({ isLoading: true, isForbidden: true, hasError: true, notice: 'Group created.' }),
    );

    expect(view.isLoading).toBe(true);
    expect(view.isForbidden).toBe(true);
    expect(view.hasError).toBe(true);
    expect(view.notice).toBe('Group created.');
  });
});
