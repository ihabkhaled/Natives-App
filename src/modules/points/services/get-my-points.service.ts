import { requestMyPoints } from '../gateways/points.gateway';
import { runPointsRequest } from '../helpers/to-points-error.helper';
import { mapPointsSummary } from '../mappers/points.mapper';
import type { PointsSummary } from '../types/points.types';

/** Use case: the caller's own points summary and append-only ledger. */
export function getMyPoints(teamId: string): Promise<PointsSummary> {
  return runPointsRequest(async () => mapPointsSummary(await requestMyPoints(teamId)));
}
