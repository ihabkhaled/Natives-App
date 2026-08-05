import { useAppMutation, useQueryClient } from '@/packages/query';

import { drillsQueryKeys } from '../queries/drills.keys';
import { createDrill } from '../services/create-drill.service';
import type { CreateDrillCommand, Drill } from '../types/drills.types';
import type { DrillMutationView, DrillWriteCallbacks } from './drills-mutations.types';

/**
 * Add a drill to the catalogue. The created record is written straight into
 * the detail cache on success, so navigating to it immediately shows what the
 * server actually stored rather than refetching to learn what was just sent.
 */
export function useCreateDrillMutation(
  teamId: string,
  callbacks: DrillWriteCallbacks,
): DrillMutationView<CreateDrillCommand> {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<Drill, CreateDrillCommand>({
    mutationFn: createDrill,
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
