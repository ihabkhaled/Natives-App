import { runRequest } from '@/shared/errors';

import { requestDrills } from '../gateways/drills.gateway';
import type { DrillsPage, DrillsQuery } from '../types/drills.types';

/** Use case: one bounded page of the team's drill catalogue. */
export function listDrills(query: DrillsQuery): Promise<DrillsPage> {
  return runRequest(() => requestDrills(query));
}
