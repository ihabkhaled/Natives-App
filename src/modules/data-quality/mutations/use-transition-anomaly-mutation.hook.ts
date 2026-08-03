import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { dataQualityQueryKeys } from '../queries/data-quality.keys';
import { transitionAnomaly } from '../services/transition-anomaly.service';
import type { Anomaly, AnomalyTransition } from '../types/data-quality.types';
import type { DataQualityMutationCallbacks } from './data-quality-mutations.types';

export interface TransitionInput {
  readonly anomalyId: string;
  readonly transition: AnomalyTransition;
  readonly expectedRecordVersion: number;
}

/**
 * Move one anomaly through its lifecycle. The record version travels with the
 * command so the server refuses the move when another operator got there
 * first, rather than overwriting their decision.
 */
export function useTransitionAnomalyMutation(
  teamId: string,
  callbacks: DataQualityMutationCallbacks,
): InvalidatingMutationView<TransitionInput> {
  return useInvalidatingMutation<Anomaly, TransitionInput>({
    mutationFn: (input) =>
      transitionAnomaly({
        teamId,
        anomalyId: input.anomalyId,
        transition: input.transition,
        expectedRecordVersion: input.expectedRecordVersion,
        resolution: null,
      }),
    invalidateKey: dataQualityQueryKeys.team(teamId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
