import { APP_PATHS } from '@/shared/config';

export const SUBMISSION_ID_PARAM = 'submissionId';

/** Route pattern and navigation target for the member training workspace. */
export function trainingPath(): string {
  return APP_PATHS.training;
}

/** Route pattern for one training submission detail screen. */
export function trainingSubmissionPattern(): string {
  return APP_PATHS.trainingSubmission;
}

/** Navigation target for one training submission detail screen. */
export function trainingSubmissionPath(submissionId: string): string {
  return APP_PATHS.trainingSubmission.replace(
    `:${SUBMISSION_ID_PARAM}`,
    encodeURIComponent(submissionId),
  );
}

/** Route pattern and navigation target for the reviewer queue. */
export function trainingReviewPath(): string {
  return APP_PATHS.trainingReview;
}
