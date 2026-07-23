import { useAppQuery } from '@/packages/query';
import type { AppError } from '@/shared/errors/app.errors';
import { toAppError } from '@/shared/errors/app-error.helper';

import { buildMyMeasurementsQueryOptions } from '../queries/development.query';
import type { MeasurementProtocolHistory } from '../types/assessments.types';

export interface MyMeasurementsQueryView {
  readonly history: readonly MeasurementProtocolHistory[] | undefined;
  readonly isLoading: boolean;
  readonly error: AppError | null;
}

/** Own measurement history; never fires without `analytics.read.self`. */
export function useMyMeasurementsQuery(
  teamId: string,
  canReadOwnAnalytics: boolean,
): MyMeasurementsQueryView {
  const query = useAppQuery<readonly MeasurementProtocolHistory[]>(
    buildMyMeasurementsQueryOptions(teamId, canReadOwnAnalytics),
  );
  return {
    history: query.data,
    isLoading: canReadOwnAnalytics && query.isPending,
    error: query.error === null ? null : toAppError(query.error),
  };
}
