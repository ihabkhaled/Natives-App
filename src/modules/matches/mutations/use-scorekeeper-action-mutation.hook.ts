import { HAPTIC_IMPACT, triggerHapticImpact } from '@/packages/capacitor-haptics';
import { useAppMutation, useQueryClient } from '@/packages/query';

import { matchesQueryKeys } from '../queries/matches.keys';
import { recordScorekeeperAction } from '../services/record-scorekeeper-action.service';
import type {
  ScorekeeperActionResult,
  ScorekeeperActionStatus,
  ScorekeeperPayload,
} from '../types/matches.types';

export interface ScorekeeperActionScope {
  readonly ownerUserId: string;
  readonly teamId: string;
  readonly matchId: string;
  readonly isOnline: boolean;
  readonly onResult: (status: ScorekeeperActionStatus) => void;
}

interface ScorekeeperActionVariables {
  readonly payload: ScorekeeperPayload;
  readonly baseStreamVersion: number;
}

export interface ScorekeeperActionMutationView {
  readonly submit: (variables: ScorekeeperActionVariables) => void;
  readonly isSubmitting: boolean;
}

/**
 * One scorekeeper command, delivered through the queue.
 *
 * `networkMode: 'always'` is deliberate: offline is a first-class path here,
 * because the service queues rather than throws. The tap gets an immediate
 * haptic so a scorekeeper watching the field — not the screen — knows it
 * registered, while the score itself only moves when the server confirms.
 */
export function useScorekeeperActionMutation(
  scope: ScorekeeperActionScope,
): ScorekeeperActionMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<ScorekeeperActionResult, ScorekeeperActionVariables>({
    networkMode: 'always',
    mutationFn: async (variables) => {
      void triggerHapticImpact(HAPTIC_IMPACT.Medium);
      return recordScorekeeperAction(
        {
          ownerUserId: scope.ownerUserId,
          teamId: scope.teamId,
          matchId: scope.matchId,
          baseStreamVersion: variables.baseStreamVersion,
          payload: variables.payload,
        },
        scope.isOnline,
      );
    },
    onSuccess: (result) => {
      scope.onResult(result.status);
      void queryClient.invalidateQueries({
        queryKey: matchesQueryKeys.detail(scope.teamId, scope.matchId),
      });
    },
    onError: () => {
      scope.onResult('failed');
    },
  });
  return {
    submit: (variables) => {
      mutation.mutate(variables);
    },
    isSubmitting: mutation.isPending,
  };
}
