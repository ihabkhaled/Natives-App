import { useAppQuery } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildDashboardSummaryQueryOptions } from '../queries/dashboard.query';
import type { DashboardSummary } from '../types/dashboard.types';

export interface DashboardSummaryQueryView {
  readonly summary: DashboardSummary | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

export function useDashboardSummaryQuery(): DashboardSummaryQueryView {
  const query = useAppQuery<DashboardSummary>(buildDashboardSummaryQueryOptions());
  return {
    summary: query.data,
    isLoading: query.isPending,
    error: query.error === null ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
