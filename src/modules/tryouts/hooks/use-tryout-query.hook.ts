import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildTryoutQueryOptions } from '../queries/tryouts.query';
import type { TryoutEvent } from '../types/tryouts.types';

/** One tryout event record. */
export function useTryoutQuery(teamId: string, tryoutId: string): RemoteQueryView<TryoutEvent> {
  return toRemoteQueryView(useAppQuery<TryoutEvent>(buildTryoutQueryOptions(teamId, tryoutId)));
}
