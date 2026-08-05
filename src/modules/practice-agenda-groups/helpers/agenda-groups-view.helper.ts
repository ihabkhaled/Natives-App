import { I18N_KEYS } from '@/shared/i18n';

import { AGENDA_GROUP_COLOR_SWATCHES } from '../constants/practice-agenda-groups.constants';
import type { AgendaGroup, AgendaGroupsPlan } from '../types/practice-agenda-groups.types';
import type {
  CopyAgendaFormView,
  CreateGroupFormView,
  GroupMemberRowView,
  GroupRowView,
  PracticeAgendaGroupsScreenView,
} from '../types/practice-agenda-groups-view.types';
import { isFilledIn } from './agenda-groups-form.helper';
import { buildResolvedBlockViews } from './resolved-plan-blocks.helper';

const KEYS = I18N_KEYS.practiceAgendaGroups;

/** Translate with optional interpolation, as the i18n package exposes it. */
type Translate = (key: string, params?: Readonly<Record<string, string | number>>) => string;

/** The create-group form's fields, addressed by name so the hook stays a plain record. */
export interface CreateGroupFormState {
  readonly name: string;
  readonly color: string;
  readonly coachMembershipId: string;
  readonly notes: string;
}

/** Everything the screen needs that is not copy. */
export interface AgendaGroupsViewInput {
  readonly plan: AgendaGroupsPlan | undefined;
  readonly isLoading: boolean;
  readonly isForbidden: boolean;
  readonly hasError: boolean;
  readonly notice: string | null;
  /** Coarse on purpose: any group command in flight holds every control still. */
  readonly isMutating: boolean;
  readonly createForm: CreateGroupFormState;
  readonly onCreateFieldChange: (field: keyof CreateGroupFormState, value: string) => void;
  readonly onCreateSubmit: () => void;
  readonly copySourceSessionId: string;
  readonly onCopySourceChange: (value: string) => void;
  readonly onCopySubmit: () => void;
  readonly addMemberValues: Readonly<Record<string, string>>;
  readonly onAddMemberValueChange: (groupId: string, value: string) => void;
  readonly onAddMember: (groupId: string) => void;
  readonly onRemoveMember: (groupId: string, membershipId: string) => void;
  readonly onRemoveGroup: (groupId: string) => void;
}

/** Static copy — the strings that never depend on server state. */
function buildChrome(
  t: Translate,
): Pick<
  PracticeAgendaGroupsScreenView,
  | 'title'
  | 'subtitle'
  | 'loadingLabel'
  | 'errorTitle'
  | 'errorMessage'
  | 'planHeading'
  | 'blocksEmptyLabel'
  | 'groupsHeading'
  | 'groupsEmptyLabel'
> {
  return {
    title: t(KEYS.title),
    subtitle: t(KEYS.subtitle),
    loadingLabel: t(KEYS.loadingLabel),
    errorTitle: t(KEYS.errorTitle),
    errorMessage: t(KEYS.errorMessage),
    planHeading: t(KEYS.planHeading),
    blocksEmptyLabel: t(KEYS.blocksEmpty),
    groupsHeading: t(KEYS.groupsHeading),
    groupsEmptyLabel: t(KEYS.groupsEmpty),
  };
}

/**
 * The status chip's text. The three server values (`draft`, `published`,
 * `completed`) are interpolated verbatim rather than mapped through a second
 * set of labels — the same restraint `practice-reminders` uses for `kinds`,
 * where naming a server-owned catalogue a second time only invites the two
 * lists drifting apart.
 */
function buildStatusLabel(t: Translate, plan: AgendaGroupsPlan | undefined): string {
  const status = plan?.status;
  if (status === undefined || status === null) {
    return '';
  }
  return t(KEYS.statusLabel, { status });
}

function buildMemberRow(
  groupId: string,
  membershipId: string,
  t: Translate,
  input: AgendaGroupsViewInput,
): GroupMemberRowView {
  return {
    membershipId,
    removeLabel: t(KEYS.removeMemberLabel),
    isRemoving: input.isMutating,
    onRemove: () => {
      input.onRemoveMember(groupId, membershipId);
    },
  };
}

function buildGroupRow(
  group: AgendaGroup,
  t: Translate,
  input: AgendaGroupsViewInput,
): GroupRowView {
  const addMemberValue = input.addMemberValues[group.id] ?? '';
  return {
    id: group.id,
    name: group.name,
    color: group.color,
    notes: group.notes,
    members: group.members.map((member) => buildMemberRow(group.id, member.membershipId, t, input)),
    membersEmptyLabel: t(KEYS.membersEmpty),
    addMemberLabel: t(KEYS.addMemberLabel),
    addMemberPlaceholder: t(KEYS.addMemberPlaceholder),
    addMemberValue,
    onAddMemberValueChange: (value) => {
      input.onAddMemberValueChange(group.id, value);
    },
    addMemberSubmitLabel: t(KEYS.addMemberSubmit),
    canAddMember: isFilledIn(addMemberValue) && !input.isMutating,
    isAddingMember: input.isMutating,
    onAddMember: () => {
      input.onAddMember(group.id);
    },
    removeGroupLabel: t(KEYS.removeGroupLabel),
    isRemovingGroup: input.isMutating,
    onRemoveGroup: () => {
      input.onRemoveGroup(group.id);
    },
  };
}

function buildGroupRows(
  groups: readonly AgendaGroup[],
  t: Translate,
  input: AgendaGroupsViewInput,
): readonly GroupRowView[] {
  return [...groups]
    .sort((left, right) => left.position - right.position)
    .map((group) => buildGroupRow(group, t, input));
}

function buildCreateForm(t: Translate, input: AgendaGroupsViewInput): CreateGroupFormView {
  const { createForm } = input;
  return {
    heading: t(KEYS.createHeading),
    nameLabel: t(KEYS.createNameLabel),
    nameValue: createForm.name,
    onNameChange: (value) => {
      input.onCreateFieldChange('name', value);
    },
    colorLabel: t(KEYS.createColorLabel),
    colorValue: createForm.color,
    colorOptions: AGENDA_GROUP_COLOR_SWATCHES.map((swatch) => ({
      value: swatch.value,
      label: t(swatch.labelKey),
    })),
    onColorChange: (value) => {
      input.onCreateFieldChange('color', value);
    },
    coachLabel: t(KEYS.createCoachLabel),
    coachValue: createForm.coachMembershipId,
    onCoachChange: (value) => {
      input.onCreateFieldChange('coachMembershipId', value);
    },
    notesLabel: t(KEYS.createNotesLabel),
    notesValue: createForm.notes,
    onNotesChange: (value) => {
      input.onCreateFieldChange('notes', value);
    },
    submitLabel: t(KEYS.createSubmit),
    canSubmit: isFilledIn(createForm.name) && !input.isMutating,
    isSaving: input.isMutating,
    onSubmit: input.onCreateSubmit,
  };
}

function buildCopyForm(t: Translate, input: AgendaGroupsViewInput): CopyAgendaFormView {
  return {
    heading: t(KEYS.copyHeading),
    sourceLabel: t(KEYS.copySourceLabel),
    sourceValue: input.copySourceSessionId,
    onSourceChange: input.onCopySourceChange,
    submitLabel: t(KEYS.copySubmit),
    canSubmit: isFilledIn(input.copySourceSessionId) && !input.isMutating,
    isCopying: input.isMutating,
    onSubmit: input.onCopySubmit,
  };
}

/**
 * Assemble the whole view from small, focused builders.
 *
 * Extracted from the screen hook so the hook only wires queries, mutations and
 * form state, and every piece of copy resolution is testable without
 * rendering.
 */
export function buildAgendaGroupsView(
  t: Translate,
  input: AgendaGroupsViewInput,
): PracticeAgendaGroupsScreenView {
  const { plan } = input;
  return {
    ...buildChrome(t),
    isLoading: input.isLoading,
    isForbidden: input.isForbidden,
    hasError: input.hasError,
    statusLabel: buildStatusLabel(t, plan),
    blocks: plan === undefined ? [] : buildResolvedBlockViews(t, plan.blocks, plan.groups),
    groups: plan === undefined ? [] : buildGroupRows(plan.groups, t, input),
    createForm: buildCreateForm(t, input),
    copyForm: buildCopyForm(t, input),
    notice: input.notice,
  };
}
