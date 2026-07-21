/** Server-owned match lifecycle states (backend 503). */
export const MATCH_STATUS = {
  Scheduled: 'scheduled',
  Ready: 'ready',
  Live: 'live',
  Paused: 'paused',
  Halftime: 'halftime',
  Completed: 'completed',
  Finalized: 'finalized',
  Abandoned: 'abandoned',
} as const;

export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

export const MATCH_STATUSES = [
  MATCH_STATUS.Scheduled,
  MATCH_STATUS.Ready,
  MATCH_STATUS.Live,
  MATCH_STATUS.Paused,
  MATCH_STATUS.Halftime,
  MATCH_STATUS.Completed,
  MATCH_STATUS.Finalized,
  MATCH_STATUS.Abandoned,
] as const;

export const MATCH_RESULTS = ['win', 'loss', 'draw', 'undecided'] as const;
export const MATCH_CAPS = ['none', 'soft', 'hard', 'time'] as const;
export const SCORING_SIDES = ['us', 'them'] as const;
export const MATCH_EVENT_TYPES = [
  'point',
  'timeout',
  'period_start',
  'period_end',
  'cap_applied',
  'void',
] as const;

/** The transitions the backend state machine accepts on POST /transition. */
export const MATCH_TRANSITIONS = [
  'ready',
  'start',
  'pause',
  'resume',
  'halftime',
  'complete',
] as const;

export type MatchTransition = (typeof MATCH_TRANSITIONS)[number];
export type ScoringSide = (typeof SCORING_SIDES)[number];

/** The scorekeeper commands the offline queue can hold. */
export const SCOREKEEPER_OPERATION_KIND = {
  Point: 'point',
  Timeout: 'timeout',
  Void: 'void',
} as const;

export type ScorekeeperOperationKind =
  (typeof SCOREKEEPER_OPERATION_KIND)[keyof typeof SCOREKEEPER_OPERATION_KIND];

export const SCOREKEEPER_OPERATION_KINDS = [
  SCOREKEEPER_OPERATION_KIND.Point,
  SCOREKEEPER_OPERATION_KIND.Timeout,
  SCOREKEEPER_OPERATION_KIND.Void,
] as const;

/** Per-operation queue state; `conflict` is terminal until a human resolves it. */
export const SCOREKEEPER_QUEUE_STATE = {
  Pending: 'pending',
  Retrying: 'retrying',
  Conflict: 'conflict',
  Failed: 'failed',
} as const;

export type ScorekeeperQueueState =
  (typeof SCOREKEEPER_QUEUE_STATE)[keyof typeof SCOREKEEPER_QUEUE_STATE];

export const SCOREKEEPER_QUEUE_STATES = [
  SCOREKEEPER_QUEUE_STATE.Pending,
  SCOREKEEPER_QUEUE_STATE.Retrying,
  SCOREKEEPER_QUEUE_STATE.Conflict,
  SCOREKEEPER_QUEUE_STATE.Failed,
] as const;

/** The authoritative outcome the backend reports for an idempotent command. */
export const MATCH_OPERATION_OUTCOME = {
  Applied: 'applied',
  Replayed: 'replayed',
  Conflict: 'conflict',
} as const;

export type MatchOperationOutcome =
  (typeof MATCH_OPERATION_OUTCOME)[keyof typeof MATCH_OPERATION_OUTCOME];

export const MATCH_OPERATION_OUTCOMES = [
  MATCH_OPERATION_OUTCOME.Applied,
  MATCH_OPERATION_OUTCOME.Replayed,
  MATCH_OPERATION_OUTCOME.Conflict,
] as const;

/**
 * Bounded native-safe queue. At the limit the scorekeeper is BLOCKED with
 * recovery guidance — the oldest action is never silently dropped, because
 * a dropped point is a wrong final score.
 */
export const SCOREKEEPER_QUEUE_LIMIT = 40;

/** Attempts before an operation is parked as `failed` and needs a manual retry. */
export const SCOREKEEPER_MAX_RETRIES = 3;

/** Bounded, deterministically ordered reads. */
export const MATCH_PAGE_PARAMS = { limit: 20, offset: 0 } as const;
export const MATCH_EVENT_PAGE_PARAMS = { limit: 200, offset: 0 } as const;

/** How many events the timeline renders; the stream itself stays bounded above. */
export const MATCH_TIMELINE_LIMIT = 25;

/** Minimum characters the backend accepts for a correction reason. */
export const CORRECTION_REASON_MIN_LENGTH = 5;
