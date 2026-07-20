import { I18N_KEYS, type I18nKey } from '@/shared/i18n';

/**
 * Leaderboard and ledger vocabulary, mirroring the backend points module.
 * Every rank, total, and badge is computed server-side; nothing in this
 * module ever recalculates a score.
 */
export const LEADERBOARD_PERIOD = {
  weekly: 'weekly',
  monthly: 'monthly',
  season: 'season',
  allTime: 'all_time',
} as const;

export type LeaderboardPeriod = (typeof LEADERBOARD_PERIOD)[keyof typeof LEADERBOARD_PERIOD];

export const LEADERBOARD_PERIODS: readonly LeaderboardPeriod[] = Object.values(LEADERBOARD_PERIOD);

export const LEADERBOARD_COHORT = {
  active: 'active',
  inactive: 'inactive',
  suspended: 'suspended',
  all: 'all',
} as const;

export type LeaderboardCohort = (typeof LEADERBOARD_COHORT)[keyof typeof LEADERBOARD_COHORT];

export const LEADERBOARD_COHORTS: readonly LeaderboardCohort[] = Object.values(LEADERBOARD_COHORT);

/** How the server broke ties. Displayed verbatim so the rule is auditable. */
export const TIE_MODE = {
  competition: 'competition',
  dense: 'dense',
  ordinal: 'ordinal',
} as const;

export type TieMode = (typeof TIE_MODE)[keyof typeof TIE_MODE];

export const RANK_MOVEMENT = {
  up: 'up',
  down: 'down',
  steady: 'steady',
  none: 'none',
} as const;

export type RankMovement = (typeof RANK_MOVEMENT)[keyof typeof RANK_MOVEMENT];

export const LEDGER_ENTRY_TYPE = {
  award: 'award',
  reversal: 'reversal',
  manualAdjustment: 'manual_adjustment',
  importAdjustment: 'import_adjustment',
  expiry: 'expiry',
} as const;

export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPE)[keyof typeof LEDGER_ENTRY_TYPE];

export const LEDGER_ENTRY_TYPES: readonly LedgerEntryType[] = Object.values(LEDGER_ENTRY_TYPE);

export const LEDGER_SOURCE_TYPE = {
  activitySubmission: 'activity_submission',
  manual: 'manual',
  import: 'import',
  system: 'system',
} as const;

export type LedgerSourceType = (typeof LEDGER_SOURCE_TYPE)[keyof typeof LEDGER_SOURCE_TYPE];

export const LEDGER_SOURCE_TYPES: readonly LedgerSourceType[] = Object.values(LEDGER_SOURCE_TYPE);

/**
 * Published badge thresholds. The three below are shown as CANDIDATES so a
 * member can see what is next; the fourth tier is unresolved in the backend
 * and is therefore never displayed at all.
 */
export const BADGE_CANDIDATE_THRESHOLDS: readonly number[] = [100, 200, 450];

/** The unresolved legacy tier. Never rendered, never inferred. */
export const UNPUBLISHED_BADGE_THRESHOLD = 649;

export const PERIOD_LABEL_KEYS: Record<LeaderboardPeriod, I18nKey> = {
  [LEADERBOARD_PERIOD.weekly]: I18N_KEYS.points.periodWeekly,
  [LEADERBOARD_PERIOD.monthly]: I18N_KEYS.points.periodMonthly,
  [LEADERBOARD_PERIOD.season]: I18N_KEYS.points.periodSeason,
  [LEADERBOARD_PERIOD.allTime]: I18N_KEYS.points.periodAllTime,
};

export const COHORT_LABEL_KEYS: Record<LeaderboardCohort, I18nKey> = {
  [LEADERBOARD_COHORT.active]: I18N_KEYS.points.cohortActive,
  [LEADERBOARD_COHORT.inactive]: I18N_KEYS.points.cohortInactive,
  [LEADERBOARD_COHORT.suspended]: I18N_KEYS.points.cohortSuspended,
  [LEADERBOARD_COHORT.all]: I18N_KEYS.points.cohortAll,
};

export const TIE_MODE_LABEL_KEYS: Record<TieMode, I18nKey> = {
  [TIE_MODE.competition]: I18N_KEYS.points.tieRuleCompetition,
  [TIE_MODE.dense]: I18N_KEYS.points.tieRuleDense,
  [TIE_MODE.ordinal]: I18N_KEYS.points.tieRuleOrdinal,
};

export const MOVEMENT_LABEL_KEYS: Record<RankMovement, I18nKey> = {
  [RANK_MOVEMENT.up]: I18N_KEYS.points.movementUp,
  [RANK_MOVEMENT.down]: I18N_KEYS.points.movementDown,
  [RANK_MOVEMENT.steady]: I18N_KEYS.points.movementSteady,
  [RANK_MOVEMENT.none]: I18N_KEYS.points.movementNone,
};

/** Movement is never colour-only: each carries a glyph and a text label. */
export const MOVEMENT_GLYPHS: Record<RankMovement, string> = {
  [RANK_MOVEMENT.up]: '▲',
  [RANK_MOVEMENT.down]: '▼',
  [RANK_MOVEMENT.steady]: '＝',
  [RANK_MOVEMENT.none]: '–',
};

export const MOVEMENT_TONES: Record<RankMovement, string> = {
  [RANK_MOVEMENT.up]: 'success',
  [RANK_MOVEMENT.down]: 'warning',
  [RANK_MOVEMENT.steady]: 'medium',
  [RANK_MOVEMENT.none]: 'medium',
};

export const LEDGER_ENTRY_LABEL_KEYS: Record<LedgerEntryType, I18nKey> = {
  [LEDGER_ENTRY_TYPE.award]: I18N_KEYS.points.entryAward,
  [LEDGER_ENTRY_TYPE.reversal]: I18N_KEYS.points.entryReversal,
  [LEDGER_ENTRY_TYPE.manualAdjustment]: I18N_KEYS.points.entryManualAdjustment,
  [LEDGER_ENTRY_TYPE.importAdjustment]: I18N_KEYS.points.entryImportAdjustment,
  [LEDGER_ENTRY_TYPE.expiry]: I18N_KEYS.points.entryExpiry,
};

export const LEDGER_SOURCE_LABEL_KEYS: Record<LedgerSourceType, I18nKey> = {
  [LEDGER_SOURCE_TYPE.activitySubmission]: I18N_KEYS.points.sourceActivitySubmission,
  [LEDGER_SOURCE_TYPE.manual]: I18N_KEYS.points.sourceManual,
  [LEDGER_SOURCE_TYPE.import]: I18N_KEYS.points.sourceImport,
  [LEDGER_SOURCE_TYPE.system]: I18N_KEYS.points.sourceSystem,
};

/** An award reads positive, everything that removes points reads negative. */
export const LEDGER_ENTRY_TONES: Record<LedgerEntryType, string> = {
  [LEDGER_ENTRY_TYPE.award]: 'success',
  [LEDGER_ENTRY_TYPE.reversal]: 'warning',
  [LEDGER_ENTRY_TYPE.manualAdjustment]: 'primary',
  [LEDGER_ENTRY_TYPE.importAdjustment]: 'primary',
  [LEDGER_ENTRY_TYPE.expiry]: 'medium',
};

export const LEADERBOARD_LIMITS = {
  pageSize: 50,
  chartBarHeight: 28,
  chartBarGap: 10,
  chartWidth: 320,
} as const;
