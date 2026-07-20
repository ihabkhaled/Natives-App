import { requestSquadAvailability } from '../gateways/squads.gateway';
import { runRequest } from '@/shared/errors';
import { mapAvailabilityPage } from '../mappers/squad.mapper';
import type { SquadAvailabilityPage } from '../types/competitions.types';

/** Use case: declared availability for the squad's selection window. */
export function listSquadAvailability(
  teamId: string,
  squadId: string,
): Promise<SquadAvailabilityPage> {
  return runRequest(async () =>
    mapAvailabilityPage(await requestSquadAvailability(teamId, squadId)),
  );
}
