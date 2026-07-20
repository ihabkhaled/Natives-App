import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/**
 * Members-domain vocabularies as `as const` maps (TypeScript enums are banned).
 * Wire values mirror the backend members contract; the client owns the i18n key
 * each value renders through, so raw backend copy is never displayed.
 */
export const MEMBERSHIP_STATUS = {
  invited: 'invited',
  active: 'active',
  inactive: 'inactive',
  suspended: 'suspended',
  left: 'left',
  archived: 'archived',
  anonymized: 'anonymized',
} as const;

export type MembershipStatus = (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];

export const MEMBERSHIP_STATUS_VALUES: readonly MembershipStatus[] =
  Object.values(MEMBERSHIP_STATUS);

const PLAYER_GENDER = {
  man: 'man',
  woman: 'woman',
  nonbinary: 'nonbinary',
  undisclosed: 'undisclosed',
} as const;

export type PlayerGender = (typeof PLAYER_GENDER)[keyof typeof PLAYER_GENDER];

const AGE_CLASSIFICATION = {
  u17: 'u17',
  u20: 'u20',
  senior: 'senior',
  masters: 'masters',
  grandMasters: 'grand_masters',
} as const;

export type AgeClassification = (typeof AGE_CLASSIFICATION)[keyof typeof AGE_CLASSIFICATION];

/** Where a member alias came from — a manual entry or a migration import. */
export type AliasSource = 'manual' | 'import';

/** The distinct shaped profile a response was rendered for. */
export const MEMBER_AUDIENCE = {
  public: 'public',
  teammate: 'teammate',
  self: 'self',
  coach: 'coach',
  admin: 'admin',
} as const;

export type MemberAudience = (typeof MEMBER_AUDIENCE)[keyof typeof MEMBER_AUDIENCE];

/** Assignable team roles, ordered least-to-most privileged. */
export const MEMBER_ROLE = {
  member: 'member',
  scorekeeper: 'scorekeeper',
  analyst: 'analyst',
  coach: 'coach',
  teamAdmin: 'team_admin',
} as const;

export type MemberRole = (typeof MEMBER_ROLE)[keyof typeof MEMBER_ROLE];

/** Ordered role options rendered in the assignment panel. */
export const MEMBER_ROLE_OPTIONS: readonly MemberRole[] = [
  MEMBER_ROLE.member,
  MEMBER_ROLE.scorekeeper,
  MEMBER_ROLE.analyst,
  MEMBER_ROLE.coach,
  MEMBER_ROLE.teamAdmin,
];

/** Lifecycle actions offered in the admin panel (reactivate reuses activate). */
export const LIFECYCLE_ACTION = {
  activate: 'activate',
  reactivate: 'reactivate',
  deactivate: 'deactivate',
  suspend: 'suspend',
  archive: 'archive',
  leave: 'leave',
} as const;

export type LifecycleAction = (typeof LIFECYCLE_ACTION)[keyof typeof LIFECYCLE_ACTION];

/** The backend endpoint segment each action posts to. */
export const LIFECYCLE_ACTION_ENDPOINT: Record<LifecycleAction, string> = {
  [LIFECYCLE_ACTION.activate]: 'activate',
  [LIFECYCLE_ACTION.reactivate]: 'activate',
  [LIFECYCLE_ACTION.deactivate]: 'deactivate',
  [LIFECYCLE_ACTION.suspend]: 'suspend',
  [LIFECYCLE_ACTION.archive]: 'archive',
  [LIFECYCLE_ACTION.leave]: 'leave',
};

export const MEMBERSHIP_STATUS_LABEL_KEYS: Record<MembershipStatus, I18nKey> = {
  [MEMBERSHIP_STATUS.invited]: I18N_KEYS.members.statusInvited,
  [MEMBERSHIP_STATUS.active]: I18N_KEYS.members.statusActive,
  [MEMBERSHIP_STATUS.inactive]: I18N_KEYS.members.statusInactive,
  [MEMBERSHIP_STATUS.suspended]: I18N_KEYS.members.statusSuspended,
  [MEMBERSHIP_STATUS.left]: I18N_KEYS.members.statusLeft,
  [MEMBERSHIP_STATUS.archived]: I18N_KEYS.members.statusArchived,
  [MEMBERSHIP_STATUS.anonymized]: I18N_KEYS.members.statusAnonymized,
};

/** Ionic colour per status; calm and meaningful, never a rainbow. */
export const MEMBERSHIP_STATUS_TONE: Record<MembershipStatus, string> = {
  [MEMBERSHIP_STATUS.invited]: 'warning',
  [MEMBERSHIP_STATUS.active]: 'success',
  [MEMBERSHIP_STATUS.inactive]: 'medium',
  [MEMBERSHIP_STATUS.suspended]: 'danger',
  [MEMBERSHIP_STATUS.left]: 'medium',
  [MEMBERSHIP_STATUS.archived]: 'medium',
  [MEMBERSHIP_STATUS.anonymized]: 'medium',
};

export const PLAYER_GENDER_LABEL_KEYS: Record<PlayerGender, I18nKey> = {
  [PLAYER_GENDER.man]: I18N_KEYS.members.genderMan,
  [PLAYER_GENDER.woman]: I18N_KEYS.members.genderWoman,
  [PLAYER_GENDER.nonbinary]: I18N_KEYS.members.genderNonbinary,
  [PLAYER_GENDER.undisclosed]: I18N_KEYS.members.genderUndisclosed,
};

export const AGE_CLASSIFICATION_LABEL_KEYS: Record<AgeClassification, I18nKey> = {
  [AGE_CLASSIFICATION.u17]: I18N_KEYS.members.ageU17,
  [AGE_CLASSIFICATION.u20]: I18N_KEYS.members.ageU20,
  [AGE_CLASSIFICATION.senior]: I18N_KEYS.members.ageSenior,
  [AGE_CLASSIFICATION.masters]: I18N_KEYS.members.ageMasters,
  [AGE_CLASSIFICATION.grandMasters]: I18N_KEYS.members.ageGrandMasters,
};

export const MEMBER_ROLE_LABEL_KEYS: Record<MemberRole, I18nKey> = {
  [MEMBER_ROLE.member]: I18N_KEYS.members.roleMember,
  [MEMBER_ROLE.scorekeeper]: I18N_KEYS.members.roleScorekeeper,
  [MEMBER_ROLE.analyst]: I18N_KEYS.members.roleAnalyst,
  [MEMBER_ROLE.coach]: I18N_KEYS.members.roleCoach,
  [MEMBER_ROLE.teamAdmin]: I18N_KEYS.members.roleTeamAdmin,
};

export const LIFECYCLE_ACTION_LABEL_KEYS: Record<LifecycleAction, I18nKey> = {
  [LIFECYCLE_ACTION.activate]: I18N_KEYS.members.actionActivate,
  [LIFECYCLE_ACTION.reactivate]: I18N_KEYS.members.actionReactivate,
  [LIFECYCLE_ACTION.deactivate]: I18N_KEYS.members.actionDeactivate,
  [LIFECYCLE_ACTION.suspend]: I18N_KEYS.members.actionSuspend,
  [LIFECYCLE_ACTION.archive]: I18N_KEYS.members.actionArchive,
  [LIFECYCLE_ACTION.leave]: I18N_KEYS.members.actionLeave,
};

/** Ordered status options for the directory status filter. */
export const MEMBERSHIP_STATUS_FILTER_OPTIONS: readonly MembershipStatus[] = [
  MEMBERSHIP_STATUS.active,
  MEMBERSHIP_STATUS.invited,
  MEMBERSHIP_STATUS.inactive,
  MEMBERSHIP_STATUS.suspended,
  MEMBERSHIP_STATUS.left,
  MEMBERSHIP_STATUS.archived,
];

/** Bounded first-page window for the directory (never unbounded). */
export const MEMBERS_PAGE_SIZE = 20;

/** Fixed pixel height for the virtualized directory viewport. */
export const MEMBERS_LIST_HEIGHT_PX = 560;
