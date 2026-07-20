import { requestRemoveSelection } from '../gateways/squads.gateway';
import { runRequest } from '@/shared/errors';
import { mapSelection } from '../mappers/squad.mapper';
import type { SquadSelection } from '../types/competitions.types';

/** Use case: withdraw one selection from the squad. */
export function removeSquadSelection(
  teamId: string,
  squadId: string,
  membershipId: string,
): Promise<SquadSelection> {
  return runRequest(async () =>
    mapSelection(await requestRemoveSelection(teamId, squadId, membershipId)),
  );
}
