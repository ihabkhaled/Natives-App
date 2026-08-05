import { useAppMutation, useQueryClient } from '@/packages/query';

import { drillsQueryKeys } from '../queries/drills.keys';
import { archiveDrill } from '../services/archive-drill.service';
import type { ArchiveDrillCommand, Drill } from '../types/drills.types';
import type { DrillMutationView, DrillWriteCallbacks } from './drills-mutations.types';

/**
 * Retire a drill. Nothing optimistic: the status chip only flips to
 * "archived" once the server confirms it, so a coach never sees a state the
 * write might still fail to reach.
 */
export function useArchiveDrillMutation(
  teamId: string,
  callbacks: DrillWriteCallbacks,
): DrillMutationView<ArchiveDrillCommand> {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<Drill, ArchiveDrillCommand>({
    mutationFn: archiveDrill,
    onSuccess: (drill) => {
      queryClient.setQueryData(drillsQueryKeys.detail(teamId, drill.id), drill);
      callbacks.onSuccess(drill);
    },
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: drillsQueryKeys.list(teamId) });
    },
  });
  return {
    run: (command) => {
      mutation.mutate(command);
    },
    isRunning: mutation.isPending,
  };
}
