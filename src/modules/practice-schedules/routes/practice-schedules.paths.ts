import { APP_PATHS } from '@/shared/config';

export const PRACTICE_SCHEDULE_ID_PARAM = 'scheduleId';

/** The list of a team's recurring practice patterns. */
export function practiceSchedulesPath(): string {
  return APP_PATHS.practiceSchedules;
}

/**
 * The blank create form. A literal path, not a route pattern — it must be
 * declared ahead of `practiceScheduleDetailPattern` in the route table, the
 * same way `/news/manage` precedes `/news/:slug`, or a coach opening "new"
 * would match the `:scheduleId` pattern with `scheduleId` literally `"new"`.
 */
export function practiceScheduleNewPath(): string {
  return APP_PATHS.practiceScheduleNew;
}

/** The route pattern for one schedule's detail/edit screen, unresolved. */
export function practiceScheduleDetailPattern(): string {
  return APP_PATHS.practiceScheduleDetail;
}

/** The detail/edit screen for one schedule id. */
export function practiceScheduleDetailPath(scheduleId: string): string {
  return APP_PATHS.practiceScheduleDetail.replace(
    `:${PRACTICE_SCHEDULE_ID_PARAM}`,
    encodeURIComponent(scheduleId),
  );
}
