import { requestOverrideSelectPlayer } from '../gateways/squads.gateway';
import { runRequest } from '@/shared/errors';
import { mapSelection } from '../mappers/squad.mapper';
import type { OverrideSelectPlayerCommand, SquadSelection } from '../types/competitions.types';

/**
 * Use case: select a player past the advisory policy. The reason is mandatory
 * and is persisted with the selection for audit.
 */
export function overrideSelectSquadPlayer(
  teamId: string,
  squadId: string,
  command: OverrideSelectPlayerCommand,
): Promise<SquadSelection> {
  return runRequest(async () =>
    mapSelection(await requestOverrideSelectPlayer(teamId, squadId, command)),
  );
}
