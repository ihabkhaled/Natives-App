import { useAppQuery } from '@/packages/query';
import { toRemoteQueryView, type RemoteQueryView } from '@/shared/view';

import { buildSquadsQueryOptions } from '../queries/competitions.query';
import type { SquadPage } from '../types/competitions.types';

/** One bounded page of the season's squads. */
export function useSquadsQuery(teamId: string): RemoteQueryView<SquadPage> {
  return toRemoteQueryView(useAppQuery<SquadPage>(buildSquadsQueryOptions(teamId)));
}
