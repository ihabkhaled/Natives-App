import { useInvalidatingMutation } from '@/packages/query';

import { competitionsQueryKeys } from '../queries/competitions.keys';
import { removeRosterEntry } from '../services/remove-roster-entry.service';
import type { CompetitionsMutationCallbacks } from '../types/competitions-view.types';
import type { RemoveRosterEntryCommand, RosterEntry } from '../types/rosters.types';
import type { RosterEntryMutationView } from '../types/selection.types';

/** Withdraw one player from a roster, then refresh the roster caches. */
export function useRosterEntryMutation(
  teamId: string,
  rosterId: string,
  callbacks: CompetitionsMutationCallbacks,
): RosterEntryMutationView {
  return useInvalidatingMutation<RosterEntry, RemoveRosterEntryCommand>({
    mutationFn: (command) => removeRosterEntry(teamId, rosterId, command),
    invalidateKey: competitionsQueryKeys.roster(teamId, rosterId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
