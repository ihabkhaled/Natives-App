import { requestRecordManualStanding } from '../gateways/standings.gateway';
import { runStandingsRequest } from '../helpers/to-standings-error.helper';
import { mapStandingRow } from '../mappers/standings.mapper';
import type { RecordManualStandingCommand, StandingRow } from '../types/standings.types';

/** Use case: record an external row with its mandatory reconciliation note. */
export function recordManualStanding(
  teamId: string,
  command: RecordManualStandingCommand,
): Promise<StandingRow> {
  return runStandingsRequest(async () =>
    mapStandingRow(await requestRecordManualStanding(teamId, command)),
  );
}
