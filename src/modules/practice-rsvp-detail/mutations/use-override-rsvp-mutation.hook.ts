import { useAppMutation, useQueryClient } from '@/packages/query';

import { practiceRsvpDetailQueryKeys } from '../queries/practice-rsvp-detail.keys';
import { overrideRsvp } from '../services/override-rsvp.service';
import type { RsvpOverrideCommand, RsvpRecord } from '../types/practice-rsvp-detail.types';
import type {
  RsvpOverrideCallbacks,
  RsvpOverrideMutationScope,
  RsvpOverrideMutationView,
} from './practice-rsvp-detail-mutations.types';

export type RsvpOverrideInput = Omit<RsvpOverrideCommand, 'teamId' | 'sessionId'>;

/**
 * Change one member's RSVP on their behalf.
 *
 * Never optimistic: the screen renders the previous answer until the server
 * confirms the new one, because an override is somebody else's answer being
 * changed — rendering it before the write lands would show a change the
 * server might still refuse. On success every read under this session is
 * invalidated (roster, summary, and that member's history), because an
 * override touches all three at once.
 */
export function useOverrideRsvpMutation(
  scope: RsvpOverrideMutationScope,
  callbacks: RsvpOverrideCallbacks,
): RsvpOverrideMutationView & { readonly submit: (input: RsvpOverrideInput) => void } {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<RsvpRecord, RsvpOverrideInput>({
    mutationFn: (input) =>
      overrideRsvp({ teamId: scope.teamId, sessionId: scope.sessionId, ...input }),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: practiceRsvpDetailQueryKeys.session(scope.teamId, scope.sessionId),
      });
    },
  });
  return {
    submit: (input) => {
      mutation.mutate(input);
    },
    isSubmitting: mutation.isPending,
  };
}
