import { requestMySubmissions } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapSubmissionPage } from '../mappers/activity.mapper';
import type { TrainingSubmissionPage } from '../types/training.types';

/** Use case: one bounded page of the caller's own training claims. */
export function listMySubmissions(teamId: string): Promise<TrainingSubmissionPage> {
  return runTrainingRequest(async () => mapSubmissionPage(await requestMySubmissions(teamId)));
}
