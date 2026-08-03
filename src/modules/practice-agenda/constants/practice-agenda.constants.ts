/**
 * Agenda vocabularies, mirroring the backend's practice-agenda contract.
 * TypeScript enums are banned, so each one is a readonly tuple the schema
 * layer enumerates and the domain types derive from.
 */

/** Lifecycle of the agenda as a whole. */
export const AGENDA_STATUSES = ['draft', 'published', 'completed'] as const;

/** What a block is for. Rendered by the coach's own `title`, not by this key. */
export const AGENDA_BLOCK_TYPES = [
  'warmup',
  'drill',
  'water_break',
  'scrimmage',
  'conditioning',
  'cooldown',
  'discussion',
  'other',
] as const;

/** How far a block or station got once the session actually ran. */
export const AGENDA_COMPLETION_STATUSES = ['planned', 'completed', 'skipped'] as const;

/** Effort a block asks for. */
export const AGENDA_INTENSITIES = ['low', 'moderate', 'high', 'max'] as const;
