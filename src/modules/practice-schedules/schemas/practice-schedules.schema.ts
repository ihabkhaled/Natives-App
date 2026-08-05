import { practiceSessionResponseSchema } from '@/modules/practice';
import { isoDateField, isoInstantField, pagedEnvelopeFields, schemaBuilder } from '@/packages/schema';

import {
  SCHEDULE_FREQUENCY_OPTIONS,
  SCHEDULE_STATUS,
  SCHEDULE_VISIBILITY_OPTIONS,
} from '../constants/practice-schedules.constants';

const scheduleFrequencySchema = schemaBuilder.enum(SCHEDULE_FREQUENCY_OPTIONS);
const scheduleVisibilitySchema = schemaBuilder.enum(SCHEDULE_VISIBILITY_OPTIONS);
const scheduleStatusSchema = schemaBuilder.enum([SCHEDULE_STATUS.active, SCHEDULE_STATUS.archived]);

/** Exact runtime mirror of the generated NestJS `ScheduleResponseDto`. */
export const scheduleResponseSchema = schemaBuilder.object({
  id: schemaBuilder.string().min(1),
  teamId: schemaBuilder.string().min(1),
  seasonId: schemaBuilder.string().nullable(),
  name: schemaBuilder.string().min(1),
  sessionType: schemaBuilder.string().min(1),
  timezone: schemaBuilder.string().min(1),
  frequency: scheduleFrequencySchema,
  intervalWeeks: schemaBuilder.number().int().positive(),
  weekdays: schemaBuilder.array(schemaBuilder.number().int()),
  startTimeLocal: schemaBuilder.string().min(1),
  durationMinutes: schemaBuilder.number().int().positive(),
  meetOffsetMinutes: schemaBuilder.number().int().nullable(),
  rsvpCutoffMinutes: schemaBuilder.number().int().nullable(),
  defaultVenueId: schemaBuilder.string().nullable(),
  defaultField: schemaBuilder.string().nullable(),
  defaultCapacity: schemaBuilder.number().int().nullable(),
  visibility: scheduleVisibilitySchema,
  organizerUserId: schemaBuilder.string().nullable(),
  notes: schemaBuilder.string().nullable(),
  generationStart: isoDateField,
  generationUntil: isoDateField,
  exceptions: schemaBuilder.array(schemaBuilder.string()),
  status: scheduleStatusSchema,
  createdBy: schemaBuilder.string().nullable(),
  updatedBy: schemaBuilder.string().nullable(),
  createdAt: isoInstantField,
  updatedAt: isoInstantField,
  version: schemaBuilder.number().int().nonnegative(),
});

/** Exact runtime mirror of `ListSchedulesResponseDto`. */
export const listSchedulesResponseSchema = schemaBuilder.object({
  items: schemaBuilder.array(scheduleResponseSchema),
  ...pagedEnvelopeFields,
});

/**
 * Exact runtime mirror of `GenerationResultResponseDto`. `sessions` is parsed
 * through the practice module's own session schema — never a second copy of
 * that shape — even though the screen only ever surfaces the two counts.
 */
export const generationResultResponseSchema = schemaBuilder.object({
  created: schemaBuilder.number().int().nonnegative(),
  skipped: schemaBuilder.number().int().nonnegative(),
  sessions: schemaBuilder.array(practiceSessionResponseSchema),
});
