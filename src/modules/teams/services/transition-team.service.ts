import { requestTeamTransition } from '../gateways/teams.gateway';
import { runTeamsRequest } from '../helpers/to-teams-error.helper';
import { mapTeam } from '../mappers/teams.mapper';
import type { Team } from '../types/teams.types';

/**
 * Use case: move a team through its lifecycle. The transition is a named verb,
 * not a status write, so the server can refuse an illegal move outright with
 * `errors.teams.teamInvalidTransition` instead of silently accepting it.
 */
export function transitionTeam(
  teamId: string,
  transition: string,
  expectedVersion: number,
): Promise<Team> {
  return runTeamsRequest(async () =>
    mapTeam(await requestTeamTransition(teamId, transition, expectedVersion)),
  );
}
