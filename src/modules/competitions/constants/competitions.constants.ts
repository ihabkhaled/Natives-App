/**
 * Competition, squad, eligibility, and roster vocabularies. Every value
 * mirrors the backend competitions module exactly; the client never invents a
 * state the server cannot produce.
 */
export const COMPETITION_STATUSES = [
  'draft',
  'published',
  'active',
  'completed',
  'cancelled',
  'archived',
] as const;

export type CompetitionStatus = (typeof COMPETITION_STATUSES)[number];

export const COMPETITION_TYPES = [
  'league',
  'championship',
  'tournament',
  'friendly',
  'custom',
] as const;

export type CompetitionType = (typeof COMPETITION_TYPES)[number];

export const STAGE_FORMATS = ['group', 'pool', 'bracket', 'knockout', 'round_robin'] as const;

export type StageFormat = (typeof STAGE_FORMATS)[number];

export const FIXTURE_STATUSES = [
  'scheduled',
  'rescheduled',
  'ready',
  'live',
  'final',
  'abandoned',
  'cancelled',
] as const;

export type FixtureStatus = (typeof FIXTURE_STATUSES)[number];

export const HOME_AWAY_VALUES = ['home', 'away', 'neutral'] as const;

export type HomeAway = (typeof HOME_AWAY_VALUES)[number];

export const OPPONENT_STATUSES = ['active', 'archived'] as const;

export type OpponentStatus = (typeof OPPONENT_STATUSES)[number];

export const SQUAD_STATUSES = ['draft', 'published', 'locked', 'archived'] as const;

export type SquadStatus = (typeof SQUAD_STATUSES)[number];

/**
 * The advisory signals the eligibility report reports per candidate. They are
 * inputs to a coach decision, never an automatic exclusion.
 */
export const ELIGIBILITY_SIGNAL_CODES = [
  'active_status',
  'registration',
  'attendance',
  'availability',
  'injury',
  'jersey',
] as const;

export type EligibilitySignalCode = (typeof ELIGIBILITY_SIGNAL_CODES)[number];

export const ELIGIBILITY_STATUSES = [
  'passed',
  'warning',
  'failed',
  'unknown',
  'overridden',
] as const;

export type EligibilityStatus = (typeof ELIGIBILITY_STATUSES)[number];

export const AVAILABILITY_VALUES = ['available', 'unavailable', 'tentative'] as const;

export type AvailabilityValue = (typeof AVAILABILITY_VALUES)[number];

export const AVAILABILITY_SOURCES = ['self', 'coach'] as const;

export type AvailabilitySource = (typeof AVAILABILITY_SOURCES)[number];

export const SELECTION_ROLES = ['player', 'captain', 'vice_captain'] as const;

export type SelectionRole = (typeof SELECTION_ROLES)[number];

export const SELECTION_STATUSES = ['selected', 'removed'] as const;

export type SelectionStatus = (typeof SELECTION_STATUSES)[number];

export const SQUAD_TRANSITIONS = ['publish', 'lock', 'revise', 'archive'] as const;

export type SquadTransition = (typeof SQUAD_TRANSITIONS)[number];

/** Bounded paging and the server-side validation limits the UI mirrors. */
export const COMPETITION_LIMITS = {
  pageSize: 50,
  candidatePageSize: 100,
  overrideReasonMin: 5,
  reasonMax: 500,
} as const;

/** Sentinel used by every "no filter applied" select in this module. */
export const ALL_FILTER = 'all';

/** Bounded query windows every gateway read sends. */
export const PAGE_PARAMS = { limit: COMPETITION_LIMITS.pageSize, offset: 0 } as const;

export const CANDIDATE_PARAMS = {
  limit: COMPETITION_LIMITS.candidatePageSize,
  offset: 0,
} as const;

/** Neutral placeholders so a screen renders before its data arrives. */
export const EMPTY_STRUCTURE = { stages: [], rounds: [] } as const;

export const EMPTY_GENDER_RATIO = {
  men: 0,
  women: 0,
  mixed: 0,
  unknown: 0,
  total: 0,
  balanced: true,
} as const;
