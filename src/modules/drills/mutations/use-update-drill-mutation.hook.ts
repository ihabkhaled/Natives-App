import { useAppMutation, useQueryClient } from '@/packages/query';

import { drillsQueryKeys } from '../queries/drills.keys';
import { updateDrill } from '../services/update-drill.service';
import type { Drill, UpdateDrillCommand } from '../types/drills.types';
import type { DrillMutationView, DrillWriteCallbacks } from './drills-mutations.types';

/**
 * Edit a catalogue drill. A stale `expectedVersion` surfaces as a CONFLICT
 * AppError to the caller, which decides how to tell the coach and how to
 * recover — this hook only wires the write and refreshes the cache once it
 * settles, successful or not, since even a refused write means the record on
 * screen might already be out of date.
 */
export function useUpdateDrillMutation(
  teamId: string,
  callbacks: DrillWriteCallbacks,
): DrillMutationView<UpdateDrillCommand> {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<Drill, UpdateDrillCommand>({
    mutationFn: updateDrill,
    onSuccess: (drill) => {
      queryClient.setQueryData(drillsQueryKeys.detail(teamId, drill.id), drill);
      callbacks.onSuccess(drill);
    },
    onError: callbacks.onError,
    onSettled: (_drill, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: drillsQueryKeys.list(teamId) });
      void queryClient.invalidateQueries({
        queryKey: drillsQueryKeys.detail(teamId, variables.drillId),
      });
    },
  });
  return {
    run: (command) => {
      mutation.mutate(command);
    },
    isRunning: mutation.isPending,
  };
}
