import { requestActivityTypes } from '../gateways/training.gateway';
import { runTrainingRequest } from '../helpers/to-training-error.helper';
import { mapActivityTypeCatalog } from '../mappers/activity.mapper';
import type { ActivityTypeCatalog } from '../types/training.types';

/** Use case: the team's activity-type catalog with its candidate values. */
export function getActivityTypes(teamId: string): Promise<ActivityTypeCatalog> {
  return runTrainingRequest(async () => mapActivityTypeCatalog(await requestActivityTypes(teamId)));
}
