import { requestSquads } from '../gateways/squads.gateway';
import { runRequest } from '@/shared/errors';
import { mapSquadPage } from '../mappers/squad.mapper';
import type { SquadPage } from '../types/competitions.types';

/** Use case: one bounded page of the season's squads. */
export function listSquads(teamId: string): Promise<SquadPage> {
  return runRequest(async () => mapSquadPage(await requestSquads(teamId)));
}
