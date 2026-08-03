import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { dataQualityQueryKeys } from '../queries/data-quality.keys';
import { applyRepair } from '../services/apply-repair.service';
import type { Repair } from '../types/data-quality.types';
import type { DataQualityMutationCallbacks } from './data-quality-mutations.types';

/** Apply a previewed repair. The team key refresh re-reads the queue. */
export function useApplyRepairMutation(
  teamId: string,
  callbacks: DataQualityMutationCallbacks,
): InvalidatingMutationView<string> {
  return useInvalidatingMutation<Repair, string>({
    mutationFn: (anomalyId) => applyRepair({ teamId, anomalyId }),
    invalidateKey: dataQualityQueryKeys.team(teamId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
