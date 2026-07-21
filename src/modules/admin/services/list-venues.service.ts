import { runRequest } from '@/shared/errors';

import { requestVenues } from '../gateways/catalog.gateway';
import { mapVenues } from '../mappers/settings.mapper';
import type { Venue } from '../types/admin.types';

/** Use case: the venues sessions and fixtures are held at. */
export function listVenues(teamId: string): Promise<readonly Venue[]> {
  return runRequest(async () => mapVenues(await requestVenues(teamId)));
}
