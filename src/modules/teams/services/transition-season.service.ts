import { requestSeasonTransition } from '../gateways/teams.gateway';
import { runTeamsRequest } from '../helpers/to-teams-error.helper';
import { mapSeason } from '../mappers/teams.mapper';
import type { Season } from '../types/teams.types';

/** One season lifecycle move, addressed by the season it applies to. */
export interface SeasonTransitionInput {
  readonly teamId: string;
  readonly seasonId: string;
  readonly transition: string;
  readonly expectedVersion: number;
}

/**
 * Use case: move a season through its lifecycle. Exactly one season may be
 * active per team, so activating a second is a real 409
 * (`errors.teams.seasonAlreadyActive`) the caller has to explain — never
 * something to retry.
 */
export function transitionSeason(input: SeasonTransitionInput): Promise<Season> {
  return runTeamsRequest(async () =>
    mapSeason(
      await requestSeasonTransition(
        input.teamId,
        input.seasonId,
        input.transition,
        input.expectedVersion,
      ),
    ),
  );
}
