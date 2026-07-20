import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildMyPointsQueryOptions } from '../queries/points.query';
import type { PointsSummary } from '../types/points.types';

/** The caller's own total, append-only ledger, and awarded badges. */
export function useMyPointsQuery(teamId: string): RemoteQueryView<PointsSummary> {
  return toRemoteQueryView(useAppQuery<PointsSummary>(buildMyPointsQueryOptions(teamId)));
}
