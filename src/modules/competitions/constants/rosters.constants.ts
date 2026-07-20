import { COMPETITION_LIMITS } from './competitions.constants';

/**
 * Roster vocabularies. The backend roster endpoints landed in the published
 * contract, so these screens read and write the live resource; nothing here is
 * mocked beyond the MSW mirror used by tests.
 */
export const ROSTER_KINDS = ['competition', 'match'] as const;

export type RosterKind = (typeof ROSTER_KINDS)[number];

export const ROSTER_STATUSES = ['draft', 'published', 'locked', 'revised', 'archived'] as const;

export type RosterStatus = (typeof ROSTER_STATUSES)[number];

export const ROSTER_DIVISIONS = ['open', 'women', 'mixed', 'unspecified'] as const;

export type RosterDivision = (typeof ROSTER_DIVISIONS)[number];

export const ENTRY_ROLES = ['player', 'captain', 'spirit_captain', 'coach'] as const;

export type EntryRole = (typeof ENTRY_ROLES)[number];

export const LINE_ASSIGNMENTS = ['offense', 'defense', 'any'] as const;

export type LineAssignment = (typeof LINE_ASSIGNMENTS)[number];

export const FIELD_POSITIONS = ['handler', 'cutter', 'hybrid', 'unspecified'] as const;

export type FieldPosition = (typeof FIELD_POSITIONS)[number];

export const GENDER_BUCKETS = ['men', 'women', 'mixed', 'unknown'] as const;

export type GenderBucket = (typeof GENDER_BUCKETS)[number];

export const ENTRY_STATUSES = ['selected', 'withdrawn'] as const;

export type EntryStatus = (typeof ENTRY_STATUSES)[number];

/** Every constraint the server can report against a roster. */
export const VIOLATION_CODES = [
  'min_size',
  'max_size',
  'missing_captain',
  'jersey_collision',
  'missing_jersey',
  'gender_ratio',
  'line_balance',
  'unavailable_selected',
] as const;

export type ViolationCode = (typeof VIOLATION_CODES)[number];

export const VIOLATION_SEVERITIES = ['error', 'warning'] as const;

export type ViolationSeverity = (typeof VIOLATION_SEVERITIES)[number];

/** The two transitions the roster transition endpoint accepts. */
export type RosterTransition = 'publish' | 'archive';

export const SNAPSHOT_REASONS = ['published', 'locked', 'revised'] as const;

export type SnapshotReason = (typeof SNAPSHOT_REASONS)[number];

/** Bounded query windows every roster read sends. */
export const ROSTER_PAGE_PARAMS = { limit: COMPETITION_LIMITS.pageSize, offset: 0 } as const;

export const ROSTER_ENTRY_PARAMS = {
  limit: COMPETITION_LIMITS.candidatePageSize,
  offset: 0,
} as const;

/** A roster with nothing selected yet still renders its policy honestly. */
export const EMPTY_COMPOSITION = {
  selected: 0,
  women: 0,
  men: 0,
  mixed: 0,
  unknownGender: 0,
  offense: 0,
  defense: 0,
  flexible: 0,
  captains: 0,
  spiritCaptains: 0,
  missingJersey: 0,
  duplicateJerseys: 0,
  unavailableSelected: 0,
} as const;
