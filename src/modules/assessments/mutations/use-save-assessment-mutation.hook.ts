import { useAppMutation, useQueryClient } from '@/packages/query';
import { APP_ERROR_CODE } from '@/shared/errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { assessmentsQueryKeys } from '../queries/assessments.keys';
import { saveAssessmentValues } from '../services/save-assessment-values.service';
import type { AssessmentDetail, SaveAssessmentValuesInput } from '../types/assessments.types';

interface SaveCallbacks {
  readonly onSuccess: () => void;
  readonly onConflict: () => void;
  readonly onError: () => void;
}

export interface SaveAssessmentMutationView {
  readonly save: (input: SaveAssessmentValuesInput) => void;
  readonly isSaving: boolean;
}

/**
 * Draft save with optimistic concurrency. A stale `expectedRecordVersion`
 * yields a CONFLICT AppError, which surfaces its own copy and reloads the
 * server truth instead of silently overwriting a colleague's entry.
 */
export function useSaveAssessmentMutation(
  teamId: string,
  assessmentId: string,
  callbacks: SaveCallbacks,
): SaveAssessmentMutationView {
  const queryClient = useQueryClient();
  const detailKey = assessmentsQueryKeys.detail(teamId, assessmentId);
  const mutation = useAppMutation<AssessmentDetail, SaveAssessmentValuesInput>({
    mutationFn: (input) => saveAssessmentValues(teamId, assessmentId, input),
    onSuccess: (detail) => {
      queryClient.setQueryData(detailKey, detail);
      callbacks.onSuccess();
    },
    onError: (error) => {
      if (toAppError(error).code === APP_ERROR_CODE.Conflict) {
        callbacks.onConflict();
      } else {
        callbacks.onError();
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: detailKey });
    },
  });
  return {
    save: (input) => {
      mutation.mutate(input);
    },
    isSaving: mutation.isPending,
  };
}
