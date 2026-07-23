import { requestMyBuddies } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapBuddyPage } from '../mappers/activity.mapper';
import type { TrainingBuddyPage } from '../types/training.types';

/** Use case: one bounded page of buddy credits naming the caller. */
export function listMyBuddies(teamId: string): Promise<TrainingBuddyPage> {
  return runTrainingRequest(async () => mapBuddyPage(await requestMyBuddies(teamId)));
}
