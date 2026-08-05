import { schemaBuilder } from '@/packages/schema';
import { I18N_KEYS } from '@/shared/i18n';

import {
  SCHEDULE_FIELD_LIMITS,
  SCHEDULE_FREQUENCY_OPTIONS,
  SCHEDULE_VISIBILITY_OPTIONS,
} from '../constants/practice-schedules.constants';

const keys = I18N_KEYS.practiceSchedules;

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/u;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const INTEGER_PATTERN = /^\d+$/u;

/**
 * Every numeric field arrives as a string — react-hook-form's controller
 * binds one string type across the whole app (`FormFieldBinding`) — so bounds
 * are enforced with a regex plus a range refinement rather than `z.number()`.
 */
function boundedIntegerField(min: number, max: number, message: string) {
  return schemaBuilder
    .string()
    .trim()
    .regex(INTEGER_PATTERN, message)
    .refine((value) => {
      const parsed = Number.parseInt(value, 10);
      return parsed >= min && parsed <= max;
    }, message);
}

/**
 * Story validation, bounds mirrored from `CreateScheduleDto`/`UpdateScheduleDto`
 * so a coach never meets a client rule the server would have rejected
 * differently. Messages are i18n KEYS, translated by the form hook.
 */
export const scheduleFormSchema = schemaBuilder
  .object({
    name: schemaBuilder
      .string()
      .trim()
      .min(1, keys.validationNameRequired)
      .max(SCHEDULE_FIELD_LIMITS.nameMax, keys.validationNameTooLong),
    sessionType: schemaBuilder
      .string()
      .trim()
      .min(1, keys.validationSessionTypeRequired)
      .max(SCHEDULE_FIELD_LIMITS.sessionTypeMax, keys.validationSessionTypeTooLong),
    frequency: schemaBuilder.enum(SCHEDULE_FREQUENCY_OPTIONS, {
      message: keys.validationFrequencyInvalid,
    }),
    intervalWeeks: boundedIntegerField(1, SCHEDULE_FIELD_LIMITS.intervalWeeksMax, keys.validationIntervalInvalid),
    startTimeLocal: schemaBuilder.string().trim().regex(TIME_PATTERN, keys.validationStartTimeInvalid),
    durationMinutes: boundedIntegerField(1, SCHEDULE_FIELD_LIMITS.durationMax, keys.validationDurationInvalid),
    timezone: schemaBuilder
      .string()
      .trim()
      .min(1, keys.validationTimezoneRequired)
      .max(SCHEDULE_FIELD_LIMITS.timezoneMax, keys.validationTimezoneTooLong),
    generationStart: schemaBuilder.string().trim().regex(DATE_PATTERN, keys.validationDateInvalid),
    generationUntil: schemaBuilder.string().trim().regex(DATE_PATTERN, keys.validationDateInvalid),
    visibility: schemaBuilder.enum(SCHEDULE_VISIBILITY_OPTIONS, {
      message: keys.validationVisibilityInvalid,
    }),
    defaultCapacity: schemaBuilder
      .string()
      .trim()
      .refine((value) => value === '' || INTEGER_PATTERN.test(value), keys.validationCapacityInvalid)
      .refine((value) => {
        if (value === '') {
          return true;
        }
        const parsed = Number.parseInt(value, 10);
        return parsed >= 0 && parsed <= SCHEDULE_FIELD_LIMITS.capacityMax;
      }, keys.validationCapacityInvalid),
    notes: schemaBuilder.string().max(SCHEDULE_FIELD_LIMITS.notesMax, keys.validationNotesTooLong),
  })
  .refine((values) => values.generationUntil >= values.generationStart, {
    message: keys.validationDateRangeInvalid,
    path: ['generationUntil'],
  });
