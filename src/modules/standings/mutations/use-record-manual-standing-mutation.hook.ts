import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { standingsQueryKeys } from '../queries/standings.keys';
import { recordManualStanding } from '../services/record-manual-standing.service';
import type { RecordManualStandingCommand, StandingRow } from '../types/standings.types';
import type { StandingsMutationCallbacks } from '../types/standings-view.types';

/** Record one reconciled external row, then refresh the table cache. */
export function useRecordManualStandingMutation(
  teamId: string,
  callbacks: StandingsMutationCallbacks,
): InvalidatingMutationView<RecordManualStandingCommand> {
  return useInvalidatingMutation<StandingRow, RecordManualStandingCommand>({
    mutationFn: (command) => recordManualStanding(teamId, command),
    invalidateKey: standingsQueryKeys.team(teamId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
