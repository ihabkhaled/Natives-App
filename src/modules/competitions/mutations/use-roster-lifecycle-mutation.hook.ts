import { useInvalidatingMutation } from '@/packages/query';

import { competitionsQueryKeys } from '../queries/competitions.keys';
import { runRosterLifecycle } from '../services/run-roster-lifecycle.service';
import type { CompetitionsMutationCallbacks } from '../types/competitions-view.types';
import type { Roster, RosterLifecycleCommand } from '../types/rosters.types';
import type { RosterLifecycleMutationView } from '../types/selection.types';

/** Publish, lock, or archive a roster with optimistic-concurrency safety. */
export function useRosterLifecycleMutation(
  teamId: string,
  rosterId: string,
  callbacks: CompetitionsMutationCallbacks,
): RosterLifecycleMutationView {
  return useInvalidatingMutation<Roster, RosterLifecycleCommand>({
    mutationFn: (command) => runRosterLifecycle(teamId, rosterId, command),
    invalidateKey: competitionsQueryKeys.roster(teamId, rosterId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
