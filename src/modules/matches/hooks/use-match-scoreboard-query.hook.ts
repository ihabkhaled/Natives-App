import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildMatchScoreboardQueryOptions } from '../queries/matches.query';
import type { MatchScoreboard } from '../types/matches.types';

/** The server's authoritative score projection for one match. */
export function useMatchScoreboardQuery(
  teamId: string,
  matchId: string,
): RemoteQueryView<MatchScoreboard> {
  return toRemoteQueryView(
    useAppQuery<MatchScoreboard>(buildMatchScoreboardQueryOptions(teamId, matchId)),
  );
}
