import type { SchemaOutput } from '@/packages/schema';

import type {
  generationResultResponseSchema,
  listSchedulesResponseSchema,
  scheduleResponseSchema,
} from '../schemas/practice-schedules.schema';
import type {
  GenerationResult,
  PracticeSchedule,
  PracticeScheduleListPage,
  ScheduleCarryOverFields,
  ScheduleDraft,
} from '../types/practice-schedules.types';

type ScheduleDto = SchemaOutput<typeof scheduleResponseSchema>;
type ScheduleListDto = SchemaOutput<typeof listSchedulesResponseSchema>;
type GenerationResultDto = SchemaOutput<typeof generationResultResponseSchema>;

/** The wire shape of `CreateScheduleDto` / `UpdateScheduleDto`, built from a draft. */
export interface ScheduleWriteBody {
  readonly name: string;
  readonly sessionType: string;
  readonly frequency: string;
  readonly weekdays: readonly number[];
  readonly intervalWeeks: number;
  readonly startTimeLocal: string;
  readonly durationMinutes: number;
  readonly timezone: string;
  readonly generationStart: string;
  readonly generationUntil: string;
  readonly visibility: string;
  readonly defaultCapacity?: number;
  readonly notes?: string;
  readonly meetOffsetMinutes?: number;
  readonly rsvpCutoffMinutes?: number;
  readonly defaultVenueId?: string;
  readonly defaultField?: string;
  readonly organizerUserId?: string;
  readonly seasonId?: string;
  readonly exceptions?: readonly string[];
  readonly status?: string;
  readonly expectedVersion?: number;
}

/** Server-side response, translated into the app's own vocabulary. */
export function toPracticeSchedule(dto: ScheduleDto): PracticeSchedule {
  return {
    id: dto.id,
    teamId: dto.teamId,
    seasonId: dto.seasonId,
    name: dto.name,
    sessionType: dto.sessionType,
    timezone: dto.timezone,
    frequency: dto.frequency,
    intervalWeeks: dto.intervalWeeks,
    weekdays: dto.weekdays,
    startTimeLocal: dto.startTimeLocal,
    durationMinutes: dto.durationMinutes,
    meetOffsetMinutes: dto.meetOffsetMinutes,
    rsvpCutoffMinutes: dto.rsvpCutoffMinutes,
    defaultVenueId: dto.defaultVenueId,
    defaultField: dto.defaultField,
    defaultCapacity: dto.defaultCapacity,
    visibility: dto.visibility,
    organizerUserId: dto.organizerUserId,
    notes: dto.notes,
    generationStart: dto.generationStart,
    generationUntil: dto.generationUntil,
    exceptions: dto.exceptions,
    status: dto.status,
    createdAtIso: dto.createdAt,
    updatedAtIso: dto.updatedAt,
    version: dto.version,
  };
}

export function toPracticeScheduleListPage(dto: ScheduleListDto): PracticeScheduleListPage {
  return {
    items: dto.items.map(toPracticeSchedule),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
  };
}

/**
 * Only `created` and `skipped` cross into the domain. `sessions` is still
 * parsed through the practice module's schema at the gateway boundary — the
 * screen just has no use for the individual rows, only the report.
 */
export function toGenerationResult(dto: GenerationResultDto): GenerationResult {
  return { created: dto.created, skipped: dto.skipped };
}

/** The two optional fields the form itself edits. */
function draftOptionalFields(draft: ScheduleDraft): Pick<ScheduleWriteBody, 'defaultCapacity' | 'notes'> {
  const notes = draft.notes === null || draft.notes === '' ? null : draft.notes;
  return {
    ...(draft.defaultCapacity === null ? {} : { defaultCapacity: draft.defaultCapacity }),
    ...(notes === null ? {} : { notes }),
  };
}

/** Scheduling-adjacent carried-over fields: what a session inherits. */
function carryOverSchedulingFields(
  carryOver: ScheduleCarryOverFields,
): Pick<ScheduleWriteBody, 'meetOffsetMinutes' | 'rsvpCutoffMinutes' | 'seasonId'> {
  return {
    ...(carryOver.meetOffsetMinutes === null
      ? {}
      : { meetOffsetMinutes: carryOver.meetOffsetMinutes }),
    ...(carryOver.rsvpCutoffMinutes === null
      ? {}
      : { rsvpCutoffMinutes: carryOver.rsvpCutoffMinutes }),
    ...(carryOver.seasonId === null ? {} : { seasonId: carryOver.seasonId }),
  };
}

/** Identity-adjacent carried-over fields: where and who runs a session. */
function carryOverIdentityFields(
  carryOver: ScheduleCarryOverFields,
): Pick<ScheduleWriteBody, 'defaultVenueId' | 'defaultField' | 'organizerUserId' | 'exceptions'> {
  return {
    ...(carryOver.defaultVenueId === null ? {} : { defaultVenueId: carryOver.defaultVenueId }),
    ...(carryOver.defaultField === null ? {} : { defaultField: carryOver.defaultField }),
    ...(carryOver.organizerUserId === null ? {} : { organizerUserId: carryOver.organizerUserId }),
    exceptions: carryOver.exceptions,
  };
}

/** Optional fields go on the wire only when the coach — or the record — actually set them. */
function optionalWriteFields(
  draft: ScheduleDraft,
  carryOver: ScheduleCarryOverFields,
): Pick<
  ScheduleWriteBody,
  | 'defaultCapacity'
  | 'notes'
  | 'meetOffsetMinutes'
  | 'rsvpCutoffMinutes'
  | 'defaultVenueId'
  | 'defaultField'
  | 'organizerUserId'
  | 'seasonId'
  | 'exceptions'
> {
  return {
    ...draftOptionalFields(draft),
    ...carryOverSchedulingFields(carryOver),
    ...carryOverIdentityFields(carryOver),
  };
}

const EMPTY_CARRY_OVER: ScheduleCarryOverFields = {
  meetOffsetMinutes: null,
  rsvpCutoffMinutes: null,
  defaultVenueId: null,
  defaultField: null,
  organizerUserId: null,
  seasonId: null,
  exceptions: [],
};

/** `CreateScheduleDto` body: a fresh pattern carries no prior configuration. */
export function toCreateScheduleBody(draft: ScheduleDraft): ScheduleWriteBody {
  return {
    name: draft.name,
    sessionType: draft.sessionType,
    frequency: draft.frequency,
    weekdays: draft.weekdays,
    intervalWeeks: draft.intervalWeeks,
    startTimeLocal: draft.startTimeLocal,
    durationMinutes: draft.durationMinutes,
    timezone: draft.timezone,
    generationStart: draft.generationStart,
    generationUntil: draft.generationUntil,
    visibility: draft.visibility,
    ...optionalWriteFields(draft, EMPTY_CARRY_OVER),
  };
}

/**
 * `UpdateScheduleDto` body. The DTO requires `status` and `expectedVersion` on
 * every write — it is a full replace, not a sparse patch — so both travel
 * alongside the edited draft and the fields the form never shows.
 */
export function toUpdateScheduleBody(command: {
  readonly draft: ScheduleDraft;
  readonly status: string;
  readonly expectedVersion: number;
  readonly carryOver: ScheduleCarryOverFields;
}): ScheduleWriteBody {
  return {
    name: command.draft.name,
    sessionType: command.draft.sessionType,
    frequency: command.draft.frequency,
    weekdays: command.draft.weekdays,
    intervalWeeks: command.draft.intervalWeeks,
    startTimeLocal: command.draft.startTimeLocal,
    durationMinutes: command.draft.durationMinutes,
    timezone: command.draft.timezone,
    generationStart: command.draft.generationStart,
    generationUntil: command.draft.generationUntil,
    visibility: command.draft.visibility,
    status: command.status,
    expectedVersion: command.expectedVersion,
    ...optionalWriteFields(command.draft, command.carryOver),
  };
}

/** A blank draft carries this record's untouched fields forward on save. */
export function toCarryOverFields(schedule: PracticeSchedule): ScheduleCarryOverFields {
  return {
    meetOffsetMinutes: schedule.meetOffsetMinutes,
    rsvpCutoffMinutes: schedule.rsvpCutoffMinutes,
    defaultVenueId: schedule.defaultVenueId,
    defaultField: schedule.defaultField,
    organizerUserId: schedule.organizerUserId,
    seasonId: schedule.seasonId,
    exceptions: schedule.exceptions,
  };
}

/** The draft a form starts from when editing an existing schedule. */
export function toScheduleDraftFromSchedule(schedule: PracticeSchedule): ScheduleDraft {
  return {
    name: schedule.name,
    sessionType: schedule.sessionType,
    frequency: schedule.frequency,
    weekdays: schedule.weekdays,
    intervalWeeks: schedule.intervalWeeks,
    startTimeLocal: schedule.startTimeLocal,
    durationMinutes: schedule.durationMinutes,
    timezone: schedule.timezone,
    generationStart: schedule.generationStart,
    generationUntil: schedule.generationUntil,
    visibility: schedule.visibility,
    defaultCapacity: schedule.defaultCapacity,
    notes: schedule.notes,
  };
}
