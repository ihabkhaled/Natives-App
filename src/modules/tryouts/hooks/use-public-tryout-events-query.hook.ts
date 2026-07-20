import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildPublicTryoutEventsQueryOptions } from '../queries/tryouts.query';
import type { TryoutEventPage } from '../types/tryouts.types';

/** Public: the tryout events a candidate may register for. */
export function usePublicTryoutEventsQuery(): RemoteQueryView<TryoutEventPage> {
  return toRemoteQueryView(useAppQuery<TryoutEventPage>(buildPublicTryoutEventsQueryOptions()));
}
