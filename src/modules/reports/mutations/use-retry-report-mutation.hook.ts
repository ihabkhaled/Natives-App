import { useInvalidatingMutation, type InvalidatingMutationView } from '@/packages/query';

import { reportsQueryKeys } from '../queries/reports.keys';
import { retryReport } from '../services/retry-report.service';
import type { ReportJob } from '../types/reports.types';

interface RetryCallbacks {
  readonly onSuccess: () => void;
  readonly onError: (error: unknown) => void;
}

/** Retry one failed job; the list key refresh restarts the poll loop. */
export function useRetryReportMutation(
  teamId: string,
  callbacks: RetryCallbacks,
): InvalidatingMutationView<string> {
  return useInvalidatingMutation<ReportJob, string>({
    mutationFn: (jobId) => retryReport(teamId, jobId),
    invalidateKey: reportsQueryKeys.team(teamId),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
  });
}
