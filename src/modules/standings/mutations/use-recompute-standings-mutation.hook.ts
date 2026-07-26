import { useAppMutation, useQueryClient } from '@/packages/query';

import { standingsQueryKeys } from '../queries/standings.keys';
import { recomputeStandings } from '../services/recompute-standings.service';
import type { RecomputeStandingsCommand, StandingsRecomputeReport } from '../types/standings.types';
import type { RecomputeMutationView, ReportMutationCallbacks } from '../types/standings-view.types';

/**
 * Derive a competition's table from finalized matches. The reconciliation
 * report ("n finalized matches, m entrants") is handed to the caller so the
 * screen can explain an empty result instead of showing a bare table.
 */
export function useRecomputeStandingsMutation(
  teamId: string,
  callbacks: ReportMutationCallbacks<StandingsRecomputeReport>,
): RecomputeMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<StandingsRecomputeReport, RecomputeStandingsCommand>({
    mutationFn: (command) => recomputeStandings(teamId, command),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: standingsQueryKeys.team(teamId) });
    },
  });
  return {
    run: (command) => {
      mutation.mutate(command);
    },
    isRunning: mutation.isPending,
  };
}
