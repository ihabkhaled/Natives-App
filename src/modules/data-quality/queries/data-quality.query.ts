import { ANOMALY_PAGE_SIZE } from '../constants/data-quality.constants';
import { listAnomalies } from '../services/list-anomalies.service';
import type { AnomaliesPage } from '../types/data-quality.types';
import { dataQualityQueryKeys } from './data-quality.keys';

/** Query options for one page of the anomaly queue. */
export function buildAnomaliesQueryOptions(
  teamId: string,
  offset: number,
): {
  readonly queryKey: readonly unknown[];
  readonly queryFn: () => Promise<AnomaliesPage>;
} {
  return {
    queryKey: dataQualityQueryKeys.anomalies(teamId, offset),
    queryFn: (): Promise<AnomaliesPage> =>
      listAnomalies({ teamId, limit: ANOMALY_PAGE_SIZE, offset }),
  };
}
