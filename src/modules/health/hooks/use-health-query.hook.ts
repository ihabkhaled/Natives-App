import { useAppQuery } from '@/packages/query';
import { type AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildHealthQueryOptions } from '../queries/health.query';
import type { HealthStatus } from '../types/health.types';

export interface HealthQueryView {
  readonly health: HealthStatus | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
  readonly refetch: () => void;
}

export function useHealthQuery(): HealthQueryView {
  const query = useAppQuery<HealthStatus>(buildHealthQueryOptions());
  return {
    health: query.data,
    isLoading: query.isPending,
    error: query.error === null ? null : toAppError(query.error),
    refetch: () => {
      void query.refetch();
    },
  };
}
