import { useAppMutation, useQueryClient } from '@/packages/query';
import { APP_ERROR_CODE } from '@/shared/errors';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { applyOptimisticRsvp } from '../helpers/rsvp-cache.helper';
import { practiceQueryKeys } from '../queries/practice.keys';
import { submitRsvp } from '../services/submit-rsvp.service';
import type { PracticeSessionDetail, RsvpSubmission, RsvpUpdate } from '../types/practice.types';

interface RsvpMutationCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: AppError) => void;
}

interface RsvpMutationContext {
  readonly previous: PracticeSessionDetail | undefined;
}

export interface RsvpMutationView {
  readonly submit: (submission: RsvpSubmission) => void;
  readonly isSubmitting: boolean;
  readonly error: AppError | null;
  readonly isConflict: boolean;
  readonly reset: () => void;
}

/**
 * Self-RSVP mutation with an optimistic cache patch, rollback on failure, and
 * cache reconciliation. A stale version returns a CONFLICT AppError; the cache
 * is rolled back and every practice query is invalidated so the member sees the
 * authoritative latest state to respond against.
 */
export function useRsvpMutation(
  teamId: string,
  sessionId: string,
  callbacks: RsvpMutationCallbacks,
): RsvpMutationView {
  const queryClient = useQueryClient();
  const detailKey = practiceQueryKeys.detail(teamId, sessionId);
  const mutation = useAppMutation<RsvpUpdate, RsvpSubmission, unknown, RsvpMutationContext>({
    mutationFn: (submission) => submitRsvp(teamId, sessionId, submission),
    onMutate: async (submission) => {
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previous = queryClient.getQueryData<PracticeSessionDetail>(detailKey);
      if (previous !== undefined) {
        queryClient.setQueryData<PracticeSessionDetail>(
          detailKey,
          applyOptimisticRsvp(previous, submission),
        );
      }
      return { previous };
    },
    onError: (error, _submission, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData<PracticeSessionDetail>(detailKey, context.previous);
      }
      callbacks.onError(toAppError(error));
    },
    onSuccess: (update) => {
      queryClient.setQueryData<PracticeSessionDetail>(detailKey, (detail) =>
        detail === undefined
          ? undefined
          : {
              ...detail,
              rsvp: {
                ...detail.rsvp,
                ...update,
              },
            },
      );
      callbacks.onSuccess();
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: practiceQueryKeys.all });
    },
  });
  const error = mutation.error == null ? null : toAppError(mutation.error);
  return {
    submit: (submission) => {
      mutation.mutate(submission);
    },
    isSubmitting: mutation.isPending,
    error,
    isConflict: error?.code === APP_ERROR_CODE.Conflict,
    reset: () => {
      mutation.reset();
    },
  };
}
