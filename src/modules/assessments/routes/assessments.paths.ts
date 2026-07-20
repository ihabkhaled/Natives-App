import { APP_PATHS } from '@/shared/config';

export const ASSESSMENT_ID_PARAM = 'assessmentId';

/** Route pattern for the coach assessment workspace. */
export function assessmentsPattern(): string {
  return APP_PATHS.assessments;
}

/** Navigation target for the coach assessment workspace. */
export function assessmentsPath(): string {
  return APP_PATHS.assessments;
}

/** Route pattern for one assessment entry screen. */
export function assessmentEntryPattern(): string {
  return APP_PATHS.assessmentEntry;
}

/** Navigation target for one assessment entry screen. */
export function assessmentEntryPath(assessmentId: string): string {
  return APP_PATHS.assessmentEntry.replace(
    `:${ASSESSMENT_ID_PARAM}`,
    encodeURIComponent(assessmentId),
  );
}

/** Route pattern and navigation target for the player performance screen. */
export function performancePath(): string {
  return APP_PATHS.performance;
}
