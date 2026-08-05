import {
  DEFAULT_SCHEDULE_TIMEZONE,
  SCHEDULE_FREQUENCY,
  SCHEDULE_VISIBILITY,
  SCHEDULE_WEEKDAY_LABEL_KEYS,
  SCHEDULE_WEEKDAYS,
} from '../constants/practice-schedules.constants';
import type { ScheduleDraft } from '../types/practice-schedules.types';
import type { ScheduleFormValues, WeekdayOptionView } from '../types/practice-schedules-view.types';

/** Translate with optional interpolation, as the i18n package exposes it. */
type Translate = (key: string, params?: Readonly<Record<string, number>>) => string;

/** What a coach starts from when defining a schedule from scratch. */
export const EMPTY_SCHEDULE_FORM_VALUES: ScheduleFormValues = {
  name: '',
  sessionType: '',
  frequency: SCHEDULE_FREQUENCY.weekly,
  intervalWeeks: '1',
  startTimeLocal: '',
  durationMinutes: '',
  timezone: DEFAULT_SCHEDULE_TIMEZONE,
  generationStart: '',
  generationUntil: '',
  visibility: SCHEDULE_VISIBILITY.team,
  defaultCapacity: '',
  notes: '',
};

/**
 * Every field binding the form's controller understands is a string, so a
 * loaded draft's numbers are rendered as their decimal text and re-parsed on
 * submit.
 */
export function toScheduleFormValues(draft: ScheduleDraft | null): ScheduleFormValues {
  if (draft === null) {
    return EMPTY_SCHEDULE_FORM_VALUES;
  }
  return {
    name: draft.name,
    sessionType: draft.sessionType,
    frequency: draft.frequency,
    intervalWeeks: String(draft.intervalWeeks),
    startTimeLocal: draft.startTimeLocal,
    durationMinutes: String(draft.durationMinutes),
    timezone: draft.timezone,
    generationStart: draft.generationStart,
    generationUntil: draft.generationUntil,
    visibility: draft.visibility,
    defaultCapacity: draft.defaultCapacity === null ? '' : String(draft.defaultCapacity),
    notes: draft.notes ?? '',
  };
}

/**
 * The submitted, schema-validated form values plus the weekday toggles (kept
 * outside react-hook-form because its controller only understands string
 * values) become the draft the create/update services send.
 */
export function toScheduleDraft(
  values: ScheduleFormValues,
  weekdays: readonly number[],
): ScheduleDraft {
  return {
    name: values.name.trim(),
    sessionType: values.sessionType.trim(),
    frequency: values.frequency as ScheduleDraft['frequency'],
    weekdays,
    intervalWeeks: Number.parseInt(values.intervalWeeks, 10),
    startTimeLocal: values.startTimeLocal.trim(),
    durationMinutes: Number.parseInt(values.durationMinutes, 10),
    timezone: values.timezone.trim(),
    generationStart: values.generationStart.trim(),
    generationUntil: values.generationUntil.trim(),
    visibility: values.visibility as ScheduleDraft['visibility'],
    defaultCapacity: values.defaultCapacity === '' ? null : Number.parseInt(values.defaultCapacity, 10),
    notes: values.notes.trim() === '' ? null : values.notes.trim(),
  };
}

/** Add the day if it is absent, drop it if it is present — never a duplicate entry. */
export function toggleWeekday(selected: readonly number[], day: number): readonly number[] {
  return selected.includes(day)
    ? selected.filter((value) => value !== day)
    : [...selected, day].sort((a, b) => a - b);
}

/** The seven day toggles, each carrying whether the draft currently includes it. */
export function buildWeekdayOptions(
  t: Translate,
  selected: readonly number[],
): readonly WeekdayOptionView[] {
  return SCHEDULE_WEEKDAYS.map((day) => ({
    value: day,
    label: t(SCHEDULE_WEEKDAY_LABEL_KEYS[day] ?? ''),
    selected: selected.includes(day),
  }));
}
