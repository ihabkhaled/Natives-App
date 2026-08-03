import { requestAnomalies } from '../gateways/data-quality.gateway';
import type { AnomaliesPage, AnomaliesQuery } from '../types/data-quality.types';

/** One page of the anomaly queue, worst-first as the server orders it. */
export function listAnomalies(query: AnomaliesQuery): Promise<AnomaliesPage> {
  return requestAnomalies(query);
}
