import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildActivityTypesQueryOptions } from '../queries/training.query';
import type { ActivityTypeCatalog } from '../types/training.types';

/** The team's activity-type catalog with its candidate point values. */
export function useActivityTypesQuery(teamId: string): RemoteQueryView<ActivityTypeCatalog> {
  return toRemoteQueryView(
    useAppQuery<ActivityTypeCatalog>(buildActivityTypesQueryOptions(teamId)),
  );
}
