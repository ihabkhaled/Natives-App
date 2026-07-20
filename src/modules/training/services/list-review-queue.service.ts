import { requestReviewQueue } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapReviewQueue } from '../mappers/activity.mapper';
import type { ReviewQueuePage } from '../types/training.types';

/** Use case: the reviewer queue, optionally narrowed to one status. */
export function listReviewQueue(teamId: string, status: string | null): Promise<ReviewQueuePage> {
  return runTrainingRequest(async () => mapReviewQueue(await requestReviewQueue(teamId, status)));
}
