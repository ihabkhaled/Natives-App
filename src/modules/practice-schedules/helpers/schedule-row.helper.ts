import {
  SCHEDULE_FREQUENCY_LABEL_KEYS,
  SCHEDULE_STATUS,
  SCHEDULE_STATUS_LABEL_KEYS,
  SCHEDULE_WEEKDAY_LABEL_KEYS,
} from '../constants/practice-schedules.constants';
import type { PracticeSchedule } from '../types/practice-schedules.types';
import type { ScheduleRowView } from '../types/practice-schedules-view.types';

/** Translate with optional interpolation, as the i18n package exposes it. */
type Translate = (key: string, params?: Readonly<Record<string, number>>) => string;

const SUMMARY_SEPARATOR = ' · ';

/** The weekdays segment of a row's summary, or null for a one-off pattern. */
function weekdaysSegment(t: Translate, weekdays: readonly number[]): string | null {
  return weekdays.length === 0
    ? null
    : weekdays.map((day) => t(SCHEDULE_WEEKDAY_LABEL_KEYS[day] ?? '')).join(', ');
}

/**
 * One list row: name, a one-line summary of the pattern, and its status.
 * Assembled once here rather than re-derived in the component, which stays
 * presentational.
 */
export function buildScheduleRow(
  t: Translate,
  schedule: PracticeSchedule,
  detailPath: string,
): ScheduleRowView {
  const segments = [
    t(SCHEDULE_FREQUENCY_LABEL_KEYS[schedule.frequency]),
    weekdaysSegment(t, schedule.weekdays),
    schedule.startTimeLocal,
  ].filter((segment): segment is string => segment !== null);
  return {
    id: schedule.id,
    name: schedule.name,
    summary: segments.join(SUMMARY_SEPARATOR),
    statusLabel: t(SCHEDULE_STATUS_LABEL_KEYS[schedule.status]),
    isArchived: schedule.status === SCHEDULE_STATUS.archived,
    detailPath,
  };
}
