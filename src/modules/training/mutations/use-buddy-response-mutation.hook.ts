import { pointsQueryKeys } from '@/modules/points';
import { useAppMutation, useQueryClient } from '@/packages/query';

import { trainingQueryKeys } from '../queries/training.keys';
import { respondToBuddy } from '../services/respond-buddy.service';
import type { TrainingBuddy } from '../types/training.types';
import type { TrainingMutationCallbacks } from '../types/training-view.types';

interface BuddyResponseCommand {
  readonly buddyId: string;
  readonly intent: 'confirm' | 'decline';
}

export interface BuddyResponseMutationView {
  readonly respond: (command: BuddyResponseCommand) => void;
  readonly busyBuddyId: string | null;
  readonly lastIntent: 'confirm' | 'decline' | null;
}

/**
 * Confirm/decline one buddy credit. A confirmation can change the claim's
 * points outcome, so the invalidation set covers the buddy list, the caller's
 * submissions, and the points family — never just the row that was clicked.
 */
export function useBuddyResponseMutation(
  teamId: string,
  callbacks: TrainingMutationCallbacks,
): BuddyResponseMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<TrainingBuddy, BuddyResponseCommand>({
    mutationFn: (command) => respondToBuddy(teamId, command.buddyId, command.intent),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: trainingQueryKeys.myBuddies(teamId) });
      void queryClient.invalidateQueries({ queryKey: trainingQueryKeys.mySubmissions(teamId) });
      void queryClient.invalidateQueries({ queryKey: pointsQueryKeys.team(teamId) });
      callbacks.onSuccess();
    },
    onError: callbacks.onError,
  });
  return {
    respond: (command) => {
      mutation.mutate(command);
    },
    busyBuddyId: mutation.isPending ? mutation.variables.buddyId : null,
    lastIntent: mutation.isPending ? mutation.variables.intent : null,
  };
}
