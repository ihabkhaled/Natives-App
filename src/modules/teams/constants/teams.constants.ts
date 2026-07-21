import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/**
 * Teams-domain vocabularies as `as const` maps (TypeScript enums are banned).
 * Wire values mirror the backend teams contract; the client owns the i18n key
 * each value renders through, so raw backend copy is never displayed.
 */
export const TEAM_STATUS = {
  active: 'active',
  disabled: 'disabled',
  archived: 'archived',
} as const;

export type TeamStatus = (typeof TEAM_STATUS)[keyof typeof TEAM_STATUS];

export const TEAM_STATUSES = [
  TEAM_STATUS.active,
  TEAM_STATUS.disabled,
  TEAM_STATUS.archived,
] as const;

export const SEASON_STATUS = {
  draft: 'draft',
  active: 'active',
  closed: 'closed',
  archived: 'archived',
} as const;

export type SeasonStatus = (typeof SEASON_STATUS)[keyof typeof SEASON_STATUS];

export const SEASON_STATUSES = [
  SEASON_STATUS.draft,
  SEASON_STATUS.active,
  SEASON_STATUS.closed,
  SEASON_STATUS.archived,
] as const;

/**
 * The lifecycle transitions the backend exposes as their own endpoints. They
 * are not free-form status edits: the server rejects an illegal move with
 * `errors.teams.teamInvalidTransition`, so the UI only ever offers the moves
 * that are legal from the current state.
 */
export const TEAM_TRANSITION = {
  activate: 'activate',
  deactivate: 'deactivate',
  archive: 'archive',
  remove: 'remove',
} as const;

export type TeamTransition = (typeof TEAM_TRANSITION)[keyof typeof TEAM_TRANSITION];

export const SEASON_TRANSITION = {
  activate: 'activate',
  close: 'close',
  archive: 'archive',
} as const;

export type SeasonTransition = (typeof SEASON_TRANSITION)[keyof typeof SEASON_TRANSITION];

/**
 * Which transitions are legal from each state, mirroring the backend's state
 * machine. `remove` is reachable only from `archived` — offering it anywhere
 * else would be an invitation to a 409.
 */
export const TEAM_TRANSITIONS_BY_STATUS: Record<TeamStatus, readonly TeamTransition[]> = {
  [TEAM_STATUS.active]: [TEAM_TRANSITION.deactivate, TEAM_TRANSITION.archive],
  [TEAM_STATUS.disabled]: [TEAM_TRANSITION.activate, TEAM_TRANSITION.archive],
  [TEAM_STATUS.archived]: [TEAM_TRANSITION.activate, TEAM_TRANSITION.remove],
};

export const SEASON_TRANSITIONS_BY_STATUS: Record<SeasonStatus, readonly SeasonTransition[]> = {
  [SEASON_STATUS.draft]: [SEASON_TRANSITION.activate, SEASON_TRANSITION.archive],
  [SEASON_STATUS.active]: [SEASON_TRANSITION.close, SEASON_TRANSITION.archive],
  [SEASON_STATUS.closed]: [SEASON_TRANSITION.activate, SEASON_TRANSITION.archive],
  [SEASON_STATUS.archived]: [],
};

/** Bounded page sizes; the screens are administrative, not infinite feeds. */
export const TEAMS_LIMITS = {
  teamsPageSize: 50,
  seasonsPageSize: 50,
} as const;

export const TEAM_STATUS_LABEL_KEYS: Record<TeamStatus, I18nKey> = {
  [TEAM_STATUS.active]: I18N_KEYS.teamsAdmin.statusActive,
  [TEAM_STATUS.disabled]: I18N_KEYS.teamsAdmin.statusDisabled,
  [TEAM_STATUS.archived]: I18N_KEYS.teamsAdmin.statusArchived,
};

export const TEAM_STATUS_TONES: Record<TeamStatus, string> = {
  [TEAM_STATUS.active]: 'success',
  [TEAM_STATUS.disabled]: 'warning',
  [TEAM_STATUS.archived]: 'medium',
};

export const TEAM_TRANSITION_LABEL_KEYS: Record<TeamTransition, I18nKey> = {
  [TEAM_TRANSITION.activate]: I18N_KEYS.teamsAdmin.activateAction,
  [TEAM_TRANSITION.deactivate]: I18N_KEYS.teamsAdmin.deactivateAction,
  [TEAM_TRANSITION.archive]: I18N_KEYS.teamsAdmin.archiveAction,
  [TEAM_TRANSITION.remove]: I18N_KEYS.teamsAdmin.removeAction,
};

export const SEASON_STATUS_LABEL_KEYS: Record<SeasonStatus, I18nKey> = {
  [SEASON_STATUS.draft]: I18N_KEYS.seasonsAdmin.statusDraft,
  [SEASON_STATUS.active]: I18N_KEYS.seasonsAdmin.statusActive,
  [SEASON_STATUS.closed]: I18N_KEYS.seasonsAdmin.statusClosed,
  [SEASON_STATUS.archived]: I18N_KEYS.seasonsAdmin.statusArchived,
};

export const SEASON_STATUS_TONES: Record<SeasonStatus, string> = {
  [SEASON_STATUS.draft]: 'warning',
  [SEASON_STATUS.active]: 'success',
  [SEASON_STATUS.closed]: 'medium',
  [SEASON_STATUS.archived]: 'medium',
};

export const SEASON_TRANSITION_LABEL_KEYS: Record<SeasonTransition, I18nKey> = {
  [SEASON_TRANSITION.activate]: I18N_KEYS.seasonsAdmin.activateAction,
  [SEASON_TRANSITION.close]: I18N_KEYS.seasonsAdmin.closeAction,
  [SEASON_TRANSITION.archive]: I18N_KEYS.seasonsAdmin.archiveAction,
};
