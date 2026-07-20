import { requestSquad } from '../gateways/squads.gateway';
import { runRequest } from '@/shared/errors';
import { mapSquad } from '../mappers/squad.mapper';
import type { Squad } from '../types/competitions.types';

/** Use case: one squad with its policy, revision, and deadline. */
export function getSquad(teamId: string, squadId: string): Promise<Squad> {
  return runRequest(async () => mapSquad(await requestSquad(teamId, squadId)));
}
