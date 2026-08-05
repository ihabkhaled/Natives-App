import { vi } from 'vitest';

import type {
  CopyAgendaFormView,
  CreateGroupFormView,
  GroupRowView,
  PracticeAgendaGroupsScreenView,
} from '@/modules/practice-agenda-groups';

/** One assigned member with a working remove control, ready to render. */
export function buildGroupMemberRowView(
  overrides: Partial<GroupRowView['members'][number]> = {},
): GroupRowView['members'][number] {
  return {
    membershipId: 'membership-10',
    removeLabel: 'Remove',
    isRemoving: false,
    onRemove: vi.fn(),
    ...overrides,
  };
}

/** One group row: a name, a colour, one member, and a working add-member form. */
export function buildGroupRowView(overrides: Partial<GroupRowView> = {}): GroupRowView {
  return {
    id: 'group-1',
    name: 'Handlers',
    color: '#3b82f6',
    notes: 'Under-cut rotation.',
    members: [buildGroupMemberRowView()],
    membersEmptyLabel: 'No members yet.',
    addMemberLabel: 'Add a member',
    addMemberPlaceholder: 'Membership id',
    addMemberValue: '',
    onAddMemberValueChange: vi.fn(),
    addMemberSubmitLabel: 'Add',
    canAddMember: false,
    isAddingMember: false,
    onAddMember: vi.fn(),
    removeGroupLabel: 'Remove group',
    isRemovingGroup: false,
    onRemoveGroup: vi.fn(),
    ...overrides,
  };
}

function buildCreateForm(overrides: Partial<CreateGroupFormView> = {}): CreateGroupFormView {
  return {
    heading: 'New group',
    nameLabel: 'Name',
    nameValue: '',
    onNameChange: vi.fn(),
    colorLabel: 'Color',
    colorValue: '',
    colorOptions: [{ value: '', label: 'No color' }],
    onColorChange: vi.fn(),
    coachLabel: 'Coach membership id (optional)',
    coachValue: '',
    onCoachChange: vi.fn(),
    notesLabel: 'Notes (optional)',
    notesValue: '',
    onNotesChange: vi.fn(),
    submitLabel: 'Create group',
    canSubmit: false,
    isSaving: false,
    onSubmit: vi.fn(),
    ...overrides,
  };
}

function buildCopyForm(overrides: Partial<CopyAgendaFormView> = {}): CopyAgendaFormView {
  return {
    heading: 'Copy from another session',
    sourceLabel: 'Source session id',
    sourceValue: '',
    onSourceChange: vi.fn(),
    submitLabel: 'Copy plan',
    canSubmit: false,
    isCopying: false,
    onSubmit: vi.fn(),
    ...overrides,
  };
}

/** A ready groups-and-plan screen: one resolved block, one group, both forms idle. */
export function buildPracticeAgendaGroupsScreenView(
  overrides: Partial<PracticeAgendaGroupsScreenView> = {},
): PracticeAgendaGroupsScreenView {
  return {
    title: 'Groups & plan',
    subtitle: 'Split the roster into working groups.',
    isLoading: false,
    loadingLabel: 'Loading the plan…',
    isForbidden: false,
    hasError: false,
    errorTitle: 'Plan unavailable',
    errorMessage: 'The coach plan could not be read.',
    statusLabel: 'Status: published',
    planHeading: 'Resolved plan',
    blocksEmptyLabel: 'There is no agenda yet for this session.',
    blocks: [
      {
        id: 'block-1',
        title: 'Warm-up',
        durationLabel: '15 min',
        stations: [{ id: 'station-1', name: 'Deep cuts', target: null, groupLabel: 'Handlers' }],
      },
    ],
    groupsHeading: 'Groups',
    groupsEmptyLabel: 'No groups yet.',
    groups: [buildGroupRowView()],
    createForm: buildCreateForm(),
    copyForm: buildCopyForm(),
    notice: null,
    ...overrides,
  };
}
