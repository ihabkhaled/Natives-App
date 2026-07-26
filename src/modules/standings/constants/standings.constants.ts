/**
 * Closed vocabularies of the standings domain, mirrored 1:1 from the backend
 * enums (UN-506) and pinned by tests/contract/standings.contract.test.ts.
 * A table is only ever sorted by the rule version it was computed under; the
 * client renders what the server derived and never re-ranks a row.
 */
export const STANDING_SOURCES = ['derived', 'manual', 'import'] as const;
export type StandingSource = (typeof STANDING_SOURCES)[number];

export const STANDING_QUALIFICATIONS = [
  'undecided',
  'qualified',
  'eliminated',
  'promoted',
  'relegated',
] as const;
export type StandingQualification = (typeof STANDING_QUALIFICATIONS)[number];

export const STANDING_ENTRANT_KINDS = ['team', 'opponent'] as const;
export type StandingEntrantKind = (typeof STANDING_ENTRANT_KINDS)[number];

export const STANDING_TIE_BREAKS = [
  'standing_points',
  'wins',
  'point_difference',
  'points_for',
  'points_against',
  'spirit',
  'alphabetical',
] as const;
export type StandingTieBreak = (typeof STANDING_TIE_BREAKS)[number];

export const STANDING_RULE_STATUSES = ['active', 'archived'] as const;
export type StandingRuleStatus = (typeof STANDING_RULE_STATUSES)[number];

export const ACHIEVEMENT_CATEGORIES = [
  'trophy',
  'placement',
  'award',
  'milestone',
  'spirit',
  'participation',
] as const;
export type AchievementCategory = (typeof ACHIEVEMENT_CATEGORIES)[number];

export const ACHIEVEMENT_STATUSES = [
  'draft',
  'submitted',
  'approved',
  'rejected',
  'archived',
] as const;
export type AchievementStatus = (typeof ACHIEVEMENT_STATUSES)[number];

export const ACHIEVEMENT_TRANSITIONS = ['submit', 'approve', 'reject', 'archive'] as const;
export type AchievementTransition = (typeof ACHIEVEMENT_TRANSITIONS)[number];

export const ACHIEVEMENT_VISIBILITIES = ['public', 'team', 'staff'] as const;
export type AchievementVisibility = (typeof ACHIEVEMENT_VISIBILITIES)[number];

export const ACHIEVEMENT_SOURCES = ['manual', 'derived', 'import'] as const;
export type AchievementSource = (typeof ACHIEVEMENT_SOURCES)[number];

export const ACHIEVEMENT_IMPORT_OUTCOMES = [
  'imported',
  'skipped_duplicate',
  'rejected_invalid',
] as const;
export type AchievementImportOutcome = (typeof ACHIEVEMENT_IMPORT_OUTCOMES)[number];

/** Bounded paging + DTO field bounds mirrored from the backend constants. */
export const STANDINGS_LIMITS = {
  standingsPageSize: 100,
  rulesPageSize: 50,
  achievementsPageSize: 20,
  historyPageSize: 20,
  noteMinLength: 3,
  noteMaxLength: 1000,
  importMaxRows: 500,
  recordVersionMin: 1,
} as const;

/** Sentinels shared by the standings screens' filters and selects. */
export const STANDINGS_FILTER_ALL = 'all';
export const STANDINGS_MEMBER_NONE = 'none';
export const STANDINGS_MEMBERS_PAGE_SIZE = 100;
