import { useAppMutation, useQueryClient } from '@/packages/query';

import { standingsQueryKeys } from '../queries/standings.keys';
import { importAchievements } from '../services/import-achievements.service';
import type {
  AchievementImportReport,
  ImportAchievementsCommand,
} from '../types/achievements.types';
import type { ImportMutationView, ReportMutationCallbacks } from '../types/standings-view.types';

/**
 * One import run. A dry run only previews, so the cache stays untouched until
 * a real commit lands and refreshes the workspace list.
 */
export function useImportAchievementsMutation(
  teamId: string,
  callbacks: ReportMutationCallbacks<AchievementImportReport>,
): ImportMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<AchievementImportReport, ImportAchievementsCommand>({
    mutationFn: (command) => importAchievements(teamId, command),
    onSuccess: (report) => {
      if (!report.dryRun) {
        void queryClient.invalidateQueries({ queryKey: standingsQueryKeys.team(teamId) });
      }
      callbacks.onSuccess(report);
    },
    onError: callbacks.onError,
  });
  return {
    run: (command) => {
      mutation.mutate(command);
    },
    isRunning: mutation.isPending,
  };
}
