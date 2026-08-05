import type {
  ScheduleFrequency,
  ScheduleStatus,
  ScheduleVisibility,
} from '../constants/practice-schedules.constants';

/** Which team's schedule catalogue, or which one schedule, a request is about. */
export interface ScheduleTeamParams {
  readonly teamId: string;
}

export interface ScheduleItemParams {
  readonly teamId: string;
  readonly scheduleId: string;
}

/**
 * The recurring pattern a team practises on, in app-owned domain terms. Wire
 * instants are renamed to the `…Iso` convention (UTC ISO 8601); `null` means
 * "unset" and is never coerced to zero or an empty string.
 */
export interface PracticeSchedule {
  readonly id: string;
  readonly teamId: string;
  readonly seasonId: string | null;
  readonly name: string;
  readonly sessionType: string;
  readonly timezone: string;
  readonly frequency: ScheduleFrequency;
  readonly intervalWeeks: number;
  /** `Date#getDay()` numbering; empty for a one-off pattern. */
  readonly weekdays: readonly number[];
  readonly startTimeLocal: string;
  readonly durationMinutes: number;
  readonly meetOffsetMinutes: number | null;
  readonly rsvpCutoffMinutes: number | null;
  readonly defaultVenueId: string | null;
  readonly defaultField: string | null;
  readonly defaultCapacity: number | null;
  readonly visibility: ScheduleVisibility;
  readonly organizerUserId: string | null;
  readonly notes: string | null;
  readonly generationStart: string;
  readonly generationUntil: string;
  /** Occurrence dates deliberately skipped even though the pattern covers them. */
  readonly exceptions: readonly string[];
  readonly status: ScheduleStatus;
  readonly createdAtIso: string;
  readonly updatedAtIso: string;
  /** Optimistic-concurrency version; required back on every update. */
  readonly version: number;
}

export interface PracticeScheduleListPage {
  readonly items: readonly PracticeSchedule[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

/**
 * The fields a coach edits. Everything else on `PracticeSchedule` (venue,
 * organizer, season, exceptions, the offset/cutoff minutes) is not exposed as
 * a form control yet and is carried through unchanged from the loaded record
 * by the mapper, so editing the pattern never silently clears configuration
 * nobody touched.
 */
export interface ScheduleDraft {
  readonly name: string;
  readonly sessionType: string;
  readonly frequency: ScheduleFrequency;
  readonly weekdays: readonly number[];
  readonly intervalWeeks: number;
  readonly startTimeLocal: string;
  readonly durationMinutes: number;
  readonly timezone: string;
  readonly generationStart: string;
  readonly generationUntil: string;
  readonly visibility: ScheduleVisibility;
  readonly defaultCapacity: number | null;
  readonly notes: string | null;
}

/** A create write: only the draft, scoped to the team it belongs to. */
export interface ScheduleCreateCommand {
  readonly teamId: string;
  readonly draft: ScheduleDraft;
}

/**
 * An update write: the draft plus the concurrency token the server rejects a
 * stale write with. `carryOver` holds the fields the form does not edit, read
 * from the record that was loaded so they round-trip unchanged.
 */
export interface ScheduleUpdateCommand {
  readonly params: ScheduleItemParams;
  readonly draft: ScheduleDraft;
  readonly status: ScheduleStatus;
  readonly expectedVersion: number;
  readonly carryOver: ScheduleCarryOverFields;
}

/** Fields the form never shows, preserved verbatim across an edit. */
export interface ScheduleCarryOverFields {
  readonly meetOffsetMinutes: number | null;
  readonly rsvpCutoffMinutes: number | null;
  readonly defaultVenueId: string | null;
  readonly defaultField: string | null;
  readonly organizerUserId: string | null;
  readonly seasonId: string | null;
  readonly exceptions: readonly string[];
}

/** What a generation run actually did — the report a coach needs, not a guess. */
export interface GenerationResult {
  readonly created: number;
  readonly skipped: number;
}
