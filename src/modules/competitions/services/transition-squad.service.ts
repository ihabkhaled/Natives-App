import { requestTransitionSquad } from '../gateways/squads.gateway';
import { runRequest } from '@/shared/errors';
import { mapSquad } from '../mappers/squad.mapper';
import type { Squad, TransitionSquadCommand } from '../types/competitions.types';

/** Use case: publish, lock, revise, or archive a squad with its version token. */
export function transitionSquad(
  teamId: string,
  squadId: string,
  command: TransitionSquadCommand,
): Promise<Squad> {
  return runRequest(async () => mapSquad(await requestTransitionSquad(teamId, squadId, command)));
}
