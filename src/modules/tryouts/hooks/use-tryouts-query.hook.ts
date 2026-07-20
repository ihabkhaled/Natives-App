import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildTryoutsQueryOptions } from '../queries/tryouts.query';
import type { TryoutEventPage } from '../types/tryouts.types';

/** One bounded page of the team tryout events. */
export function useTryoutsQuery(teamId: string): RemoteQueryView<TryoutEventPage> {
  return toRemoteQueryView(useAppQuery<TryoutEventPage>(buildTryoutsQueryOptions(teamId)));
}
