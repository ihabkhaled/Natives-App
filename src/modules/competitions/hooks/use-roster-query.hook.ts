import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildRosterQueryOptions } from '../queries/competitions.query';
import type { Roster } from '../types/rosters.types';

/** One roster record. */
export function useRosterQuery(teamId: string, rosterId: string): RemoteQueryView<Roster> {
  return toRemoteQueryView(useAppQuery<Roster>(buildRosterQueryOptions(teamId, rosterId)));
}
