import { useAppMutation, useQueryClient } from '@/packages/query';

import { reportsQueryKeys } from '../queries/reports.keys';
import { generateReport } from '../services/generate-report.service';
import type { GenerateReportCommand, ReportJob } from '../types/reports.types';

interface GenerateCallbacks {
  readonly onSuccess: (job: ReportJob) => void;
  readonly onError: (error: unknown) => void;
}

export interface GenerateReportMutationView {
  readonly run: (command: GenerateReportCommand) => void;
  readonly isRunning: boolean;
}

/**
 * Queue one report. The created (or idempotently re-served) job is handed to
 * the caller so a duplicate submit can scroll to the existing row instead of
 * pretending a second job exists.
 */
export function useGenerateReportMutation(
  teamId: string,
  callbacks: GenerateCallbacks,
): GenerateReportMutationView {
  const queryClient = useQueryClient();
  const mutation = useAppMutation<ReportJob, GenerateReportCommand>({
    mutationFn: (command) => generateReport(teamId, command),
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: reportsQueryKeys.team(teamId) });
    },
  });
  return {
    run: (command) => {
      mutation.mutate(command);
    },
    isRunning: mutation.isPending,
  };
}
