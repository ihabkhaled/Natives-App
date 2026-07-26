import { useAppMutation, useQueryClient } from '@/packages/query';

import { analyticsQueryKeys } from '../queries/analytics.keys';
import { rebuildAnalytics } from '../services/rebuild-analytics.service';
import type { AnalyticsRebuildReport, RebuildAnalyticsCommand } from '../types/analytics.types';

interface RebuildCallbacks {
  readonly onSuccess: (report: AnalyticsRebuildReport) => void;
  readonly onError: (error: unknown) => void;
}

export interface RebuildMutationView {
  readonly run: (command: RebuildAnalyticsCommand) => void;
  readonly isRunning: boolean;
}

/**
 * One idempotent projection rebuild. Success invalidates every analytics
 * query for the team so charts, cohorts, and freshness all re-cite the new
 * calculation run.
 */
export function useRebuildAnalyticsMutation(
  teamId: string,
  callbacks: RebuildCallbacks,
): RebuildMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<AnalyticsRebuildReport, RebuildAnalyticsCommand>({
    mutationFn: (command) => rebuildAnalytics(teamId, command),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: analyticsQueryKeys.team(teamId) });
    },
  });
  return {
    run: (command) => {
      mutation.mutate(command);
    },
    isRunning: mutation.isPending,
  };
}
