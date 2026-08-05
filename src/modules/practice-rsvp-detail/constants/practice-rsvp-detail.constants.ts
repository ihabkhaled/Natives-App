/**
 * RSVP-detail-domain vocabularies as `as const` maps (TypeScript enums are
 * banned). `status` and `reasonCategory` are NOT redeclared here — they are
 * the practice module's `RSVP_STATUS`/`RSVP_REASON`, imported through its
 * public surface, because this module is the coach's view of the same
 * answers a member gives through `practice`, not a second vocabulary for them.
 */
export const RSVP_SOURCE = {
  self: 'self',
  coach: 'coach',
  admin: 'admin',
  import: 'import',
  system: 'system',
} as const;

export type RsvpSource = (typeof RSVP_SOURCE)[keyof typeof RSVP_SOURCE];

export const RSVP_NOTE_VISIBILITY = {
  coaches: 'coaches',
  team: 'team',
} as const;

export type RsvpNoteVisibility = (typeof RSVP_NOTE_VISIBILITY)[keyof typeof RSVP_NOTE_VISIBILITY];

/** Bounded first-page window; "load more" grows it by this step. */
export const RSVP_PARTICIPANTS_PAGE_SIZE = 20;

/** The contract's own `limit` ceiling; "load more" never grows past it. */
export const RSVP_PARTICIPANTS_MAX_PAGE_SIZE = 100;

/** The wire-level sentinel meaning "no status filter"; never sent as a query param. */
export const RSVP_STATUS_FILTER_ALL = '' as const;

/** The override's free-text bounds, mirroring `OverrideRsvpDto` exactly. */
export const RSVP_OVERRIDE_REASON_MAX_LENGTH = 512;
export const RSVP_OVERRIDE_NOTE_MAX_LENGTH = 1000;
