/**
 * Closed vocabularies of the analytics domain, mirrored 1:1 from the backend
 * enums (UN-700) and pinned by tests/contract/analytics.contract.test.ts.
 * Every series is a governed read model — the client never computes a
 * statistic, and suppression below the cohort threshold is a feature.
 */
export const ANALYTICS_DIMENSIONS = [
  'technical',
  'tactical',
  'physical',
  'psychological',
  'behavioral',
  'attendance',
  'consistency',
  'offense',
  'defense',
  'match_involvement',
  'overall',
  'roster_coverage',
  'training_volume',
  'assessment_coverage',
  'points',
] as const;
export type AnalyticsDimension = (typeof ANALYTICS_DIMENSIONS)[number];

export const ANALYTICS_PERIOD_TYPES = [
  'daily',
  'session',
  'monthly',
  'period',
  'season',
  'all_time',
] as const;
export type AnalyticsPeriodType = (typeof ANALYTICS_PERIOD_TYPES)[number];

export const ANALYTICS_UNITS = ['count', 'ratio', 'points', 'score', 'minutes'] as const;
export type AnalyticsUnit = (typeof ANALYTICS_UNITS)[number];

export const ANALYTICS_DIRECTIONS = ['higher_better', 'lower_better', 'neutral'] as const;
export type AnalyticsDirection = (typeof ANALYTICS_DIRECTIONS)[number];

/** The picker groups the dimension select renders, in order. */
export const DIMENSION_GROUPS = [
  {
    key: 'teamHealth',
    dimensions: [
      'attendance',
      'consistency',
      'roster_coverage',
      'training_volume',
      'assessment_coverage',
    ],
  },
  {
    key: 'performance',
    dimensions: ['overall', 'technical', 'tactical', 'physical', 'psychological', 'behavioral'],
  },
  {
    key: 'match',
    dimensions: ['offense', 'defense', 'match_involvement', 'points'],
  },
] as const;

/** Dimensions that only exist for the team subject, hidden on player screens. */
export const TEAM_ONLY_DIMENSIONS: readonly AnalyticsDimension[] = [
  'roster_coverage',
  'training_volume',
  'assessment_coverage',
];

/** Freshness/paging policy mirrored from the backend constants. */
export const ANALYTICS_LIMITS = {
  seriesLimit: 30,
  staleAfterHours: 24,
  cohortPrivacyThreshold: 5,
} as const;

/** In-house SVG canvas; no chart vendor anywhere in the app. */
export const ANALYTICS_CHART_GEOMETRY = {
  width: 640,
  height: 220,
  paddingX: 24,
  paddingY: 18,
  maxTicks: 6,
} as const;

/** The rebuild default the dialog mirrors (`RebuildAnalyticsDto`). */
export const REBUILD_DEFAULT_PERIOD_TYPE: AnalyticsPeriodType = 'monthly';

/** The directory window both screens read to resolve player names. */
export const ANALYTICS_MEMBERS_PAGE_SIZE = 100;

/** The dimension each screen opens on. */
export const DEFAULT_TEAM_DIMENSION: AnalyticsDimension = 'attendance';
export const DEFAULT_PLAYER_DIMENSION: AnalyticsDimension = 'overall';
