import { requestRecomputeStandings } from '../gateways/standings.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapRecomputeReport } from '../mappers/standings.mapper';
import type { RecomputeStandingsCommand, StandingsRecomputeReport } from '../types/standings.types';

/** Use case: derive a competition's rows from its finalized matches. */
export function recomputeStandings(
  teamId: string,
  command: RecomputeStandingsCommand,
): Promise<StandingsRecomputeReport> {
  return runStandingsRequest(async () =>
    mapRecomputeReport(await requestRecomputeStandings(teamId, command)),
  );
}
