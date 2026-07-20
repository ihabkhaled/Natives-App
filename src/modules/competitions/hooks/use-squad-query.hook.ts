import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildSquadQueryOptions } from '../queries/competitions.query';
import type { Squad } from '../types/competitions.types';

/** One squad record. */
export function useSquadQuery(teamId: string, squadId: string): RemoteQueryView<Squad> {
  return toRemoteQueryView(useAppQuery<Squad>(buildSquadQueryOptions(teamId, squadId)));
}
