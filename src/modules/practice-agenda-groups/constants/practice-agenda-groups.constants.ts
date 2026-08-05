import { I18N_KEYS } from '@/shared/i18n';

/**
 * What a group command resolved to, reported through the screen's one notice
 * line. A plain string union rather than a boolean success flag: the failure
 * case is one more member of the same set, not a second branch the caller has
 * to open.
 */
export const AGENDA_GROUP_OUTCOME = {
  GroupCreated: 'group_created',
  GroupRemoved: 'group_removed',
  MemberAdded: 'member_added',
  MemberRemoved: 'member_removed',
  AgendaCopied: 'agenda_copied',
  ActionFailed: 'action_failed',
} as const;

export type AgendaGroupOutcome = (typeof AGENDA_GROUP_OUTCOME)[keyof typeof AGENDA_GROUP_OUTCOME];

/**
 * A small fixed palette rather than a free colour picker. `CreateGroupDto`
 * accepts any string up to 32 characters, but a coach choosing between six
 * named swatches gets a group they can tell apart at a glance; a hex field
 * would not. The empty value means "no colour" and is sent as `null`.
 */
export const AGENDA_GROUP_COLOR_SWATCHES = [
  { value: '', labelKey: I18N_KEYS.practiceAgendaGroups.colorNone },
  { value: '#ef4444', labelKey: I18N_KEYS.practiceAgendaGroups.colorRed },
  { value: '#3b82f6', labelKey: I18N_KEYS.practiceAgendaGroups.colorBlue },
  { value: '#22c55e', labelKey: I18N_KEYS.practiceAgendaGroups.colorGreen },
  { value: '#f59e0b', labelKey: I18N_KEYS.practiceAgendaGroups.colorAmber },
  { value: '#8b5cf6', labelKey: I18N_KEYS.practiceAgendaGroups.colorViolet },
] as const;

/** The new-group form's rest state; also what it resets to after a save. */
export const EMPTY_CREATE_GROUP_FORM = {
  name: '',
  color: '',
  coachMembershipId: '',
  notes: '',
} as const;
