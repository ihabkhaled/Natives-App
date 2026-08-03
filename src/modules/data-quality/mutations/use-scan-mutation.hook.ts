import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { dataQualityQueryKeys } from '../queries/data-quality.keys';
import { runScan } from '../services/run-scan.service';
import type { ScanReport } from '../types/data-quality.types';
import type { DataQualityMutationCallbacks } from './data-quality-mutations.types';

/** Run every rule now instead of waiting for the scheduled sweep. */
export function useScanMutation(
  teamId: string,
  callbacks: DataQualityMutationCallbacks,
): InvalidatingMutationView<undefined> {
  return useInvalidatingMutation<ScanReport, undefined>({
    mutationFn: () => runScan(teamId),
    invalidateKey: dataQualityQueryKeys.team(teamId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
