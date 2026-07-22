import { I18N_KEYS } from '@/shared/i18n';

import type {
  EntryRole,
  FieldPosition,
  GenderBucket,
  LineAssignment,
  RosterDivision,
  RosterKind,
  RosterStatus,
  SnapshotReason,
  ViolationCode,
  ViolationSeverity,
} from './rosters.constants';

export const ROSTER_KIND_LABEL_KEYS: Record<RosterKind, string> = {
  competition: I18N_KEYS.rosters.kindCompetition,
  match: I18N_KEYS.rosters.kindMatch,
};

/** Label key and presentation tone for one roster lifecycle state. */
interface RosterStatusPresentation {
  readonly labelKey: string;
  readonly tone: string;
}

const ROSTER_STATUS_PRESENTATION: Record<RosterStatus, RosterStatusPresentation> = {
  draft: { labelKey: I18N_KEYS.rosters.statusDraft, tone: 'medium' },
  published: { labelKey: I18N_KEYS.rosters.statusPublished, tone: 'success' },
  locked: { labelKey: I18N_KEYS.rosters.statusLocked, tone: 'warning' },
  revised: { labelKey: I18N_KEYS.rosters.statusRevised, tone: 'primary' },
  archived: { labelKey: I18N_KEYS.rosters.statusArchived, tone: 'medium' },
};

export function rosterStatusLabelKey(status: RosterStatus): string {
  return ROSTER_STATUS_PRESENTATION[status].labelKey;
}

export function rosterStatusTone(status: RosterStatus): string {
  return ROSTER_STATUS_PRESENTATION[status].tone;
}

export const ROSTER_DIVISION_LABEL_KEYS: Record<RosterDivision, string> = {
  open: I18N_KEYS.rosters.divisionOpen,
  women: I18N_KEYS.rosters.divisionWomen,
  mixed: I18N_KEYS.rosters.divisionMixed,
  unspecified: I18N_KEYS.rosters.divisionUnspecified,
};

export const ENTRY_ROLE_LABEL_KEYS: Record<EntryRole, string> = {
  player: I18N_KEYS.rosters.rolePlayer,
  captain: I18N_KEYS.rosters.roleCaptain,
  spirit_captain: I18N_KEYS.rosters.roleSpiritCaptain,
  coach: I18N_KEYS.rosters.roleCoach,
};

export const LINE_LABEL_KEYS: Record<LineAssignment, string> = {
  offense: I18N_KEYS.rosters.lineOffense,
  defense: I18N_KEYS.rosters.lineDefense,
  any: I18N_KEYS.rosters.lineAny,
};

export const POSITION_LABEL_KEYS: Record<FieldPosition, string> = {
  handler: I18N_KEYS.rosters.positionHandler,
  cutter: I18N_KEYS.rosters.positionCutter,
  hybrid: I18N_KEYS.rosters.positionHybrid,
  unspecified: I18N_KEYS.rosters.positionUnspecified,
};

export const GENDER_LABEL_KEYS: Record<GenderBucket, string> = {
  men: I18N_KEYS.rosters.genderMen,
  women: I18N_KEYS.rosters.genderWomen,
  mixed: I18N_KEYS.rosters.genderMixed,
  unknown: I18N_KEYS.rosters.genderUnknown,
};

export const VIOLATION_LABEL_KEYS: Record<ViolationCode, string> = {
  min_size: I18N_KEYS.rosters.violationMinSize,
  max_size: I18N_KEYS.rosters.violationMaxSize,
  missing_captain: I18N_KEYS.rosters.violationMissingCaptain,
  jersey_collision: I18N_KEYS.rosters.violationJerseyCollision,
  missing_jersey: I18N_KEYS.rosters.violationMissingJersey,
  gender_ratio: I18N_KEYS.rosters.violationGenderRatio,
  line_balance: I18N_KEYS.rosters.violationLineBalance,
  unavailable_selected: I18N_KEYS.rosters.violationUnavailableSelected,
};

export const SEVERITY_LABEL_KEYS: Record<ViolationSeverity, string> = {
  error: I18N_KEYS.rosters.severityError,
  warning: I18N_KEYS.rosters.severityWarning,
};

export const SEVERITY_TONES: Record<ViolationSeverity, string> = {
  error: 'danger',
  warning: 'warning',
};

export const SNAPSHOT_REASON_LABEL_KEYS: Record<SnapshotReason, string> = {
  published: I18N_KEYS.rosters.historyPublished,
  locked: I18N_KEYS.rosters.historyLocked,
  revised: I18N_KEYS.rosters.historyRevised,
};

/** Which lifecycle actions each status offers, in the order they render. */
export const ROSTER_ACTION_LABEL_KEYS = {
  publish: I18N_KEYS.rosters.actionPublish,
  lock: I18N_KEYS.rosters.actionLock,
  archive: I18N_KEYS.rosters.actionArchive,
} as const;

export const ROSTER_ACTION_TONES = {
  publish: 'primary',
  lock: 'secondary',
  archive: 'danger',
} as const;

/**
 * The composition figures the validation panel reports, in reading order.
 * `field` names the `RosterComposition` member so the panel stays a mapping
 * rather than ten near-identical literals.
 */
export const ROSTER_COMPOSITION_ROWS = [
  { key: 'selected', field: 'selected', labelKey: I18N_KEYS.rosters.compositionSelected },
  { key: 'women', field: 'women', labelKey: I18N_KEYS.rosters.compositionWomen },
  { key: 'men', field: 'men', labelKey: I18N_KEYS.rosters.compositionMen },
  { key: 'mixed', field: 'mixed', labelKey: I18N_KEYS.rosters.compositionMixed },
  { key: 'unknown', field: 'unknownGender', labelKey: I18N_KEYS.rosters.compositionUnknown },
  { key: 'offense', field: 'offense', labelKey: I18N_KEYS.rosters.compositionOffense },
  { key: 'defense', field: 'defense', labelKey: I18N_KEYS.rosters.compositionDefense },
  { key: 'flexible', field: 'flexible', labelKey: I18N_KEYS.rosters.compositionFlexible },
  { key: 'captains', field: 'captains', labelKey: I18N_KEYS.rosters.compositionCaptains },
  {
    key: 'missingJersey',
    field: 'missingJersey',
    labelKey: I18N_KEYS.rosters.compositionMissingJersey,
  },
] as const;
