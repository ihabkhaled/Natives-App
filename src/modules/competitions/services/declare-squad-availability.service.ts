import { requestDeclareAvailability } from '../gateways/squads.gateway';
import { runRequest } from '@/shared/errors';
import { mapAvailability } from '../mappers/squad.mapper';
import type { DeclareAvailabilityCommand, SquadAvailability } from '../types/competitions.types';

/** Use case: a player declares availability for this squad window. */
export function declareSquadAvailability(
  teamId: string,
  squadId: string,
  command: DeclareAvailabilityCommand,
): Promise<SquadAvailability> {
  return runRequest(async () =>
    mapAvailability(await requestDeclareAvailability(teamId, squadId, command)),
  );
}
