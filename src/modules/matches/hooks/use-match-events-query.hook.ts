import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildMatchEventsQueryOptions } from '../queries/matches.query';
import type { MatchEvent } from '../types/matches.types';

/** The append-only event stream for one match, newest first. */
export function useMatchEventsQuery(
  teamId: string,
  matchId: string,
): RemoteQueryView<readonly MatchEvent[]> {
  return toRemoteQueryView(
    useAppQuery<readonly MatchEvent[]>(buildMatchEventsQueryOptions(teamId, matchId)),
  );
}
