import { requestBuddyResponse } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapBuddyRecord } from '../mappers/activity.mapper';
import type { TrainingBuddy } from '../types/training.types';

/** Use case: confirm or decline one buddy credit naming the caller. */
export function respondToBuddy(
  teamId: string,
  buddyId: string,
  intent: 'confirm' | 'decline',
): Promise<TrainingBuddy> {
  return runTrainingRequest(async () =>
    mapBuddyRecord(await requestBuddyResponse(teamId, buddyId, intent)),
  );
}
