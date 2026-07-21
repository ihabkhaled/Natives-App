import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildMatchRulesetsQueryOptions } from '../queries/matches.query';
import type { MatchRuleset } from '../types/matches.types';

/** Published rule sets; every cap the scoreboard prints comes from one. */
export function useMatchRulesetsQuery(teamId: string): RemoteQueryView<readonly MatchRuleset[]> {
  return toRemoteQueryView(
    useAppQuery<readonly MatchRuleset[]>(buildMatchRulesetsQueryOptions(teamId)),
  );
}
