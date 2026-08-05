/**
 * Drill vocabularies, mirroring the backend's drill-catalogue contract.
 * TypeScript enums are banned, so each one is a readonly tuple the schema
 * layer enumerates and the domain types derive from.
 */

/** What kind of work the drill is for. */
export const DRILL_CATEGORIES = [
  'warmup',
  'conditioning',
  'throwing',
  'cutting',
  'defense',
  'offense',
  'scrimmage',
  'set_play',
  'cooldown',
  'other',
] as const;

/** Effort the drill asks for. */
export const DRILL_INTENSITIES = ['low', 'moderate', 'high', 'max'] as const;

/**
 * Lifecycle of a catalogue entry. There is no third state: `archive` is a
 * retirement, not a delete, so an archived drill keeps its id and keeps
 * resolving for every past agenda station that still references it.
 */
export const DRILL_STATUSES = ['active', 'archived'] as const;

/** Named access to the two statuses, so a helper reads `DRILL_STATUS.Archived`
 * rather than repeating the literal `'archived'`. */
export const DRILL_STATUS = {
  Active: DRILL_STATUSES[0],
  Archived: DRILL_STATUSES[1],
} as const;

/** A sensible starting point for a new drill; the coach can change it. */
export const DRILL_DEFAULT_INTENSITY = 'moderate';

/**
 * Bounded first page of the team's drill library (never unbounded). A
 * team-authored catalogue runs to dozens of drills, not thousands, so one
 * generous page covers browsing without a second paging control the coach
 * would rarely need.
 */
export const DRILLS_PAGE_PARAMS = { limit: 50, offset: 0 } as const;

/** Wire limits mirrored from the create/update DTOs, so a coach never meets a
 * client rule the server would not also enforce (and vice versa). */
export const DRILL_FIELD_LIMITS = {
  nameMin: 1,
  nameMax: 120,
  objectiveMax: 500,
  instructionsMax: 4000,
  safetyNotesMax: 1000,
  mediaUrlMax: 1000,
  equipmentMaxItems: 30,
  skillTagsMaxItems: 30,
  durationMin: 1,
  durationMax: 600,
} as const;

/**
 * The `:drillId` route value that opens the detail screen with a blank form
 * instead of fetching. Keeping create and edit on the same route means the
 * module ships exactly the two screens the brief asks for — a list and a
 * detail/edit screen — rather than a third, near-identical create route.
 */
export const DRILL_NEW_ID = 'new';

/** Sentinel option value meaning "no filter applied" in a select field. */
export const DRILLS_ALL_FILTER = 'all';
