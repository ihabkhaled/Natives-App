import { runRequest } from '@/shared/errors';

import { requestSeasons } from '../gateways/catalog.gateway';
import { mapSeasons } from '../mappers/settings.mapper';
import type { Season } from '../types/admin.types';

/** Use case: the team's season windows. */
export function listSeasons(teamId: string): Promise<readonly Season[]> {
  return runRequest(async () => mapSeasons(await requestSeasons(teamId)));
}
