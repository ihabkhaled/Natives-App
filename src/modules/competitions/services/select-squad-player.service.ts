import { requestSelectPlayer } from '../gateways/squads.gateway';
import { runRequest } from '@/shared/errors';
import { mapSelection } from '../mappers/squad.mapper';
import type { SelectPlayerCommand, SquadSelection } from '../types/competitions.types';

/** Use case: select a player who already meets the squad policy. */
export function selectSquadPlayer(
  teamId: string,
  squadId: string,
  command: SelectPlayerCommand,
): Promise<SquadSelection> {
  return runRequest(async () => mapSelection(await requestSelectPlayer(teamId, squadId, command)));
}
